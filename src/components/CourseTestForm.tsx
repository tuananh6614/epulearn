
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Award, Clock, RotateCcw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourseTest } from "@/integrations/supabase/testServices";

interface CourseTestFormProps {
  test: CourseTest;
  courseId: string;
  onComplete: (score: number, passed: boolean, timeTaken: number, answers: Record<string, number>) => void;
}

const CourseTestForm = ({ test, courseId, onComplete }: CourseTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.time_limit * 60);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [cheatAttempts, setCheatAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  // Create a form schema for the test
  const formSchema = z.object({
    answers: z.array(z.number().optional())
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: Array(test.questions.length).fill(undefined)
    },
  });

  // Format time from seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check for tab switching (cheat detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !showResults) {
        setCheatAttempts(prev => prev + 1);
        toast.error("Cảnh báo! Chuyển tab được ghi nhận là gian lận trong bài kiểm tra.", {
          duration: 5000,
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showResults]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      
      // Convert answers to record format for API
      const answersRecord: Record<string, number> = {};

      test.questions.forEach((question, index) => {
        const points = question.points || 1;
        totalPoints += points;
        
        // Add to answers record
        if (data.answers[index] !== undefined) {
          answersRecord[question.id] = data.answers[index] as number;
        }
        
        if (data.answers[index] === question.correct_answer) {
          correctAnswers++;
          earnedPoints += points;
        }
      });

      const percentage = Math.round((earnedPoints / totalPoints) * 100);
      const passed = percentage >= test.passing_score;
      const finalTimeTaken = test.time_limit * 60 - timeLeft;

      setScore(percentage);
      setShowResults(true);
      setTimeTaken(finalTimeTaken);
      
      // Call the onComplete callback to save results
      await onComplete(percentage, passed, finalTimeTaken, answersRecord);
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error("Có lỗi xảy ra khi nộp bài kiểm tra");
      setIsSubmitting(false);
    }
  };

  // Navigate between questions
  const goToNextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Restart the test
  const restartTest = () => {
    form.reset();
    setCurrentQuestion(0);
    setShowResults(false);
    setTimeLeft(test.time_limit * 60);
    setCheatAttempts(0);
  };

  // Timer effect
  React.useEffect(() => {
    if (showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("Hết thời gian làm bài!");
          form.handleSubmit(onSubmit)();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults]);

  // If showing results, render the results screen
  if (showResults) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Kết quả bài kiểm tra</CardTitle>
          <CardDescription>
            {score >= test.passing_score 
              ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra" 
              : "Bạn chưa đạt điểm yêu cầu để vượt qua bài kiểm tra"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-5xl font-bold text-primary">{score}%</span>
          </div>
          
          <Progress value={score} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">Điểm đạt được</p>
              <p>{score}%</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">Điểm đạt yêu cầu</p>
              <p>{test.passing_score}%</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">Số câu đúng</p>
              <p>{form.getValues().answers.filter((answer, index) => 
                answer === test.questions[index].correct_answer
              ).length}/{test.questions.length}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">Thời gian làm bài</p>
              <p>{Math.floor(timeTaken / 60)} phút {timeTaken % 60} giây</p>
            </div>
          </div>
          
          {cheatAttempts > 0 && (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Phát hiện {cheatAttempts} lần chuyển tab trong quá trình làm bài. Hành vi này có thể ảnh hưởng đến kết quả bài kiểm tra của bạn.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.href = `/course/${courseId}`}>
            Quay lại khóa học
          </Button>
          
          {score < test.passing_score && (
            <Button onClick={restartTest}>
              <RotateCcw className="mr-2 h-4 w-4" /> Làm lại bài kiểm tra
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Current question to display
  const currentQ = test.questions[currentQuestion];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>{test.title}</CardTitle>
          <div className="flex items-center space-x-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            <span className={`${timeLeft < 300 ? 'text-red-500' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <CardDescription>{test.description}</CardDescription>
        <Progress 
          value={(currentQuestion + 1) / test.questions.length * 100} 
          className="mt-2" 
        />
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-4">
              <div className="font-medium text-lg">
                Câu {currentQuestion + 1}: {currentQ.question}
              </div>
              
              <FormField
                control={form.control}
                name={`answers.${currentQuestion}`}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        className="space-y-2"
                      >
                        {currentQ.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent/30 transition-colors"
                          >
                            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={goToPrevQuestion}
              disabled={currentQuestion === 0}
            >
              Câu trước
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {test.questions.length}
            </div>
            
            {currentQuestion === test.questions.length - 1 ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
              </Button>
            ) : (
              <Button type="button" onClick={goToNextQuestion}>Câu tiếp</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CourseTestForm;
