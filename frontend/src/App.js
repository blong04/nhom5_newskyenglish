import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Admin
import AdminLayout from "./components/Layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";
import AdminClasses from "./pages/admin/Classes";
import AdminQuizzes from "./pages/admin/Quizzes";
import AdminEnrollments from "./pages/admin/Enrollments";
import AdminNotifications from "./pages/admin/Notifications";

// Teacher
import TeacherLayout from "./components/Layout/TeacherLayout";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherStudents from "./pages/teacher/Students";
import TeacherNotifications from "./pages/teacher/Notifications";

// Student
import StudentLayout from "./components/Layout/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentQuiz from "./pages/student/TakeQuiz";
import StudentSchedule from "./pages/student/Schedule";
import StudentExercises from "./pages/student/Exercises";
import StudentNotifications from "./pages/student/Notifications";
import StudentResults from "./pages/student/Results";

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.roleId)) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "0.9rem" } }} />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute roles={[1]}><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={<PrivateRoute roles={[2]}><TeacherLayout /></PrivateRoute>}>
          <Route index element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="notifications" element={<TeacherNotifications />} />
        </Route>

        {/* Student */}
        <Route path="/student" element={<PrivateRoute roles={[3]}><StudentLayout /></PrivateRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="quiz/:quizId" element={<StudentQuiz />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="exercises" element={<StudentExercises />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="results" element={<StudentResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}