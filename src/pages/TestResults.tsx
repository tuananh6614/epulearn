
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  TrendingUp,
  XCircle
} from 'lucide-react';
import { getUserTestResults, getTestProgressChartData } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TestProgressChart from '@/components/TestProgressChart';

const TestResults = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchTestResults = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const results = await getUserTestResults(user.id);
        setTestResults(results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test results:', error);
        setLoading(false);
      }
    };
    
    fetchTestResults();
  }, [user]);
  
  const viewTestProgress = async (lessonId: string) => {
    try {
      if (!user) return;
      
      const data = await getTestProgressChartData(user.id, lessonId);
      setProgressData(data);
      setSelectedTest(lessonId);
    } catch (error) {
      console.error('Error fetching test progress:', error);
    }
  };
  
  // Group test results by course
  const groupedResults = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    testResults.forEach(result => {
      const courseId = result.course_id;
      const courseName = result.courses?.title || 'Khóa học không xác định';
      
      if (!grouped[courseId]) {
        grouped[courseId] = [];
      }
      
      grouped[courseId].push({
        ...result,
        courseName
      });
    });
    
    return grouped;
  }, [testResults]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 bg-muted rounded w-64"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Kết quả bài kiểm tra</h1>
        <p className="text-muted-foreground mb-8">Theo dõi tiến trình làm bài kiểm tra của bạn</p>
        
        {!user ? (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vui lòng đăng nhập để xem kết quả bài kiểm tra của bạn
            </AlertDescription>
          </Alert>
        ) : Object.keys(groupedResults).length === 0 ? (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chưa có kết quả bài kiểm tra nào</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Hoàn thành các bài kiểm tra trong khóa học để theo dõi tiến trình học tập của bạn.
              </p>
              <Button onClick={() => window.location.href = '/courses'}>
                Khám phá khóa học
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedResults).map(([courseId, results]) => (
              <Card key={courseId}>
                <CardHeader>
                  <CardTitle>{results[0].courseName}</CardTitle>
                  <CardDescription>Kết quả bài kiểm tra ({results.length} lượt làm bài)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên bài kiểm tra</TableHead>
                        <TableHead>Điểm số</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày thực hiện</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <div className="font-medium">{result.test_name || 'Bài kiểm tra'}</div>
                            <div className="text-sm text-muted-foreground">
                              Lần thử #{result.attempt_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={result.score} 
                                className="h-2 w-24" 
                              />
                              <span className="font-medium">{result.score}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {result.passed ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đạt
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Chưa đạt
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(result.created_at), 'dd/MM/yyyy HH:mm')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewTestProgress(result.lesson_id)}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Xem tiến trình
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <Dialog open={!!selectedTest} onOpenChange={(open) => !open && setSelectedTest(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tiến trình làm bài kiểm tra</DialogTitle>
            </DialogHeader>
            <TestProgressChart data={progressData} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TestResults;
