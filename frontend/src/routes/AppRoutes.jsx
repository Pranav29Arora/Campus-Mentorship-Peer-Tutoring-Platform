import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Lazy-load page components for lightning-fast initial load and instant refresh
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Mentors = lazy(() => import('../pages/Mentors'));
const MentorDetails = lazy(() => import('../pages/MentorDetails'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const MentorDashboard = lazy(() => import('../pages/MentorDashboard'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const Availability = lazy(() => import('../pages/Availability'));
const Bookings = lazy(() => import('../pages/Bookings'));
const VideoCall = lazy(() => import('../pages/VideoCall'));
const Profile = lazy(() => import('../pages/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Lightweight routing loading placeholder
const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mentors" element={<Mentors />} />
      <Route path="/mentor/:id" element={<MentorDetails />} />

      {/* Student Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/mentors"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Mentors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/bookings"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/bookings/:id"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/video/:bookingId"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <VideoCall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Mentor Protected Routes */}
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/availability"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Availability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/bookings"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/video/:bookingId"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <VideoCall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/profile"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard activeTab="stats" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard activeTab="users" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mentors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Mentors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard activeTab="bookings" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard activeTab="stats" />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
  );
};

export default AppRoutes;
