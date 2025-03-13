
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Award, Clock, RotateCcw } from "lucide-react";

interface CourseTestQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  points?: number;
}

interface CourseTest {
  id: string;
  title: string;
  description?: string;
  time_limit: number;
  passing_score: number;
  questions: CourseTestQuestion[];
}

interface CourseTestFormProps {
  test: CourseTest;
  courseId: string;
  onComplete: (score: number, passed: boolean) => void;
}

const CourseTestForm = ({ test, courseId, onComplete }: CourseTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.time_limit * 60);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

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

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    test.questions.forEach((question, index) => {
      const points = question.points || 1;
      totalPoints += points;
      
      if (data.answers[index] === question.correct_answer) {
        correctAnswers++;
        earnedPoints += points;
      }
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= test.passing_score;

    setScore(percentage);
    setShowResults(true);
    onComplete(percentage, passed);
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
              <p>{Math.floor((test.time_limit * 60 - timeLeft) / 60)} phút {(test.time_limit * 60 - timeLeft) % 60} giây</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
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
              <Button type="submit">Nộp bài</Button>
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
