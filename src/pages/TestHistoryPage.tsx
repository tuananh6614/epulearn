
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

interface TestResult {
  id: string | number;
  user_id: string;
  course_id: string | number;
  score: number;
  passed: boolean;
  created_at: string;
  duration: number;
  test_type: string;
  courses?: {
    title: string;
  };
}

const TestHistoryPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Mock approach for test history
    const fetchTestHistory = async () => {
      if (!user) return;
      
      try {
        // For courseId specific history
        if (courseId) {
          console.log(`[MOCK] Fetching test history for user ${user.id} in course ${courseId}`);
          setTestHistory([
            {
              id: 1,
              user_id: user.id,
              course_id: courseId,
              score: 85,
              passed: true,
              created_at: new Date().toISOString(),
              duration: 1200,
              test_type: 'course'
            },
            {
              id: 2,
              user_id: user.id,
              course_id: courseId,
              score: 75,
              passed: true,
              created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              duration: 900,
              test_type: 'chapter'
            }
          ]);
        } else {
          // For all user tests
          console.log(`[MOCK] Fetching all test history for user ${user.id}`);
          // Mock data for all tests
          setTestHistory([
            {
              id: 1,
              user_id: user.id,
              course_id: 1,
              score: 85,
              passed: true,
              created_at: new Date().toISOString(),
              duration: 1200,
              test_type: 'course',
              courses: { title: 'JavaScript Basics' }
            },
            {
              id: 2,
              user_id: user.id,
              course_id: 2,
              score: 75,
              passed: true,
              created_at: new Date(Date.now() - 86400000).toISOString(),
              duration: 900,
              test_type: 'chapter',
              courses: { title: 'React Fundamentals' }
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching test history:', err);
        toast.error('Không thể tải lịch sử kiểm tra');
      } finally {
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, [courseId, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-20 pb-10 max-w-5xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate(courseId ? `/course/${courseId}/start` : '/courses')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Lịch sử kiểm tra</h2>
            <p className="text-muted-foreground text-sm">
              Xem lại kết quả các bài kiểm tra đã làm
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kết quả kiểm tra</CardTitle>
            <CardDescription>
              Danh sách các bài kiểm tra bạn đã hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Khóa học</TableHead>
                  <TableHead>Loại bài kiểm tra</TableHead>
                  <TableHead>Điểm số</TableHead>
                  <TableHead>Kết quả</TableHead>
                  <TableHead>Ngày hoàn thành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Đang tải lịch sử kiểm tra...
                    </TableCell>
                  </TableRow>
                ) : testHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Chưa có lịch sử kiểm tra
                    </TableCell>
                  </TableRow>
                ) : (
                  testHistory.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.courses?.title || `Khóa học #${result.course_id}`}
                      </TableCell>
                      <TableCell>{result.test_type}</TableCell>
                      <TableCell>{result.score}%</TableCell>
                      <TableCell>
                        {result.passed ? (
                          <Badge variant="outline">Đạt</Badge>
                        ) : (
                          <Badge variant="destructive">Không đạt</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(result.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestHistoryPage;
