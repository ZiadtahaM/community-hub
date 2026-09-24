import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/hooks/use-language";
import { ProtectedRoute } from "@/components/layout/protected-route";

import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Feed from "@/pages/feed";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Messages from "@/pages/messages";
import Teachers from "@/pages/teachers";
import TeacherProfile from "@/pages/teacher-profile";
import Payments from "@/pages/payments";
import MyCourses from "@/pages/my-courses";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import AssignmentDetail from "@/pages/assignment-detail";
import NewLesson from "@/pages/new-lesson";
import NewAssignment from "@/pages/new-assignment";
import Algorithms from "@/pages/algorithms";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/feed">
        <ProtectedRoute><Feed /></ProtectedRoute>
      </Route>
      <Route path="/courses">
        <ProtectedRoute><Courses /></ProtectedRoute>
      </Route>
      <Route path="/courses/:courseId">
        {() => <ProtectedRoute><CourseDetail /></ProtectedRoute>}
      </Route>
      <Route path="/courses/:courseId/lessons/new">
        {() => <ProtectedRoute allowedRoles={["teacher"]}><NewLesson /></ProtectedRoute>}
      </Route>
      <Route path="/courses/:courseId/assignments/new">
        {() => <ProtectedRoute allowedRoles={["teacher"]}><NewAssignment /></ProtectedRoute>}
      </Route>
      <Route path="/messages">
        <ProtectedRoute><Messages /></ProtectedRoute>
      </Route>
      <Route path="/teachers">
        <ProtectedRoute><Teachers /></ProtectedRoute>
      </Route>
      <Route path="/teachers/:teacherId">
        {() => <ProtectedRoute><TeacherProfile /></ProtectedRoute>}
      </Route>
      <Route path="/payments">
        <ProtectedRoute><Payments /></ProtectedRoute>
      </Route>
      <Route path="/my-courses">
        <ProtectedRoute><MyCourses /></ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute><Profile /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute allowedRoles={["admin"]}><Admin /></ProtectedRoute>
      </Route>
      <Route path="/assignments/:assignmentId">
        {() => <ProtectedRoute><AssignmentDetail /></ProtectedRoute>}
      </Route>
      <Route path="/algorithms">
        <ProtectedRoute><Algorithms /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
