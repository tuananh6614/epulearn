import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy-loaded components for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const LessonDetail = lazy(() => import("./pages/LessonDetail"));
const LessonDemo = lazy(() => import("./pages/LessonDemo"));
const MyCourses = lazy(() => import("./pages/MyCourses"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Certification = lazy(() => import("./pages/Certification"));
const VipCourses = lazy(() => import("./pages/VipCourses"));
const ChapterTestPage = lazy(() => import("./pages/ChapterTestPage"));
const CourseTest = lazy(() => import("./pages/CourseTest"));
const GeneralTestPage = lazy(() => import("./pages/GeneralTestPage"));
const StartLearningPage = lazy(() => import("./pages/StartLearningPage"));
const TestHistoryPage = lazy(() => import("./pages/TestHistoryPage"));

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-green-500" />
  </div>
);

// Configure query client with error handling and optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Giảm số lần thử lại xuống 1 lần
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 phút
      gcTime: 5 * 60 * 1000, // 5 phút
      refetchOnMount: "always",
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Public routes */}
                <Route path="/courses" element={<Courses />} />
                <Route path="/certification" element={<Certification />} />
                
                {/* Protected routes - require login */}
                <Route path="/course/:courseId" element={
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                } />
                <Route path="/my-courses" element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                
                {/* Start learning page */}
                <Route path="/course/:courseId/start" element={
                  <ProtectedRoute>
                    <StartLearningPage />
                  </ProtectedRoute>
                } />
                
                {/* Course lessons */}
                <Route path="/course/:courseId/chapter/:chapterId/lesson/:lessonId" element={
                  <ProtectedRoute>
                    <LessonDetail />
                  </ProtectedRoute>
                } />
                <Route path="/lesson-demo" element={<LessonDemo />} />
                <Route path="/demo" element={<LessonDemo />} />
                
                {/* Chapter test route */}
                <Route path="/course/:courseId/chapter/:chapterId/test" element={
                  <ProtectedRoute>
                    <ChapterTestPage />
                  </ProtectedRoute>
                } />
                
                {/* Course test routes */}
                <Route path="/course/:courseId/test" element={
                  <ProtectedRoute>
                    <GeneralTestPage />
                  </ProtectedRoute>
                } />
                
                {/* Chapter test route with lessonId */}
                <Route path="/course/:courseId/chapter/:chapterId/test/:lessonId" element={
                  <ProtectedRoute>
                    <ChapterTestPage />
                  </ProtectedRoute>
                } />
                
                {/* Update route path for certificates */}
                <Route path="/profile/certificates" element={
                  <ProtectedRoute>
                    <Navigate to="/profile" replace />
                  </ProtectedRoute>
                } />
                
                {/* VIP courses route */}
                <Route path="/vip-courses" element={<VipCourses />} />
                
                {/* Test history page */}
                <Route path="/course/:courseId/test-history" element={<ProtectedRoute element={<TestHistoryPage />} />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
