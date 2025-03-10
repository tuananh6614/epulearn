
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LessonDetail from "./pages/LessonDetail";
import LessonDemo from "./pages/LessonDemo";
import MyCourses from "./pages/MyCourses";
import UserProfile from "./pages/UserProfile";
import Certification from "./pages/Certification";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Configure query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
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
            
            {/* Course lessons */}
            <Route path="/course/:courseId/chapter/:chapterId/lesson/:lessonId" element={
              <ProtectedRoute>
                <LessonDetail />
              </ProtectedRoute>
            } />
            <Route path="/lesson-demo" element={<LessonDemo />} />
            <Route path="/demo" element={<LessonDemo />} />
            
            {/* Update route path for certificates */}
            <Route path="/profile/certificates" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
