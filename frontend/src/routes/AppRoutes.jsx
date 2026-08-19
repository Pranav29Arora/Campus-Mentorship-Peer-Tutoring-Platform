import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Pages imports
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Mentors from '../pages/Mentors';
import MentorDetails from '../pages/MentorDetails';
import StudentDashboard from '../pages/StudentDashboard';
import MentorDashboard from '../pages/MentorDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import Availability from '../pages/Availability';
import Bookings from '../pages/Bookings';
import VideoCall from '../pages/VideoCall';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;
