import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import StatCard from '../components/dashboard/StatCard';
import UpcomingSession from '../components/dashboard/UpcomingSession';
import RecentActivity from '../components/dashboard/RecentActivity';
import ReviewCard from '../components/reviews/ReviewCard';
import Button from '../components/common/Button';
import { Calendar, Clock, Users, Star, Award, PlusCircle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { bookings } = useContext(AppContext);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (user && user.mentorId) {
      // Load mentor's profile stats
      const mentors = JSON.parse(localStorage.getItem('cc_mentors') || '[]');
      const profile = mentors.find(m => m.id === user.mentorId);
      if (profile) setMentorProfile(profile);

      // Load mentor's reviews
      const allReviews = JSON.parse(localStorage.getItem('cc_reviews') || '[]');
      const filteredReviews = allReviews.filter(r => r.mentorId === user.mentorId);
      setReviews(filteredReviews);
    }
  }, [user, bookings]);

  // Compute Mentor statistics
  const mentorBookings = bookings.filter(b => b.mentorId === user?.mentorId);
  const upcomingBookings = mentorBookings.filter(b => b.status === 'upcoming');
  const completedBookings = mentorBookings.filter(b => b.status === 'completed');
  
  // Unique students connected
  const totalStudents = new Set(mentorBookings.map(b => b.studentId)).size;

  // Filter today's sessions (using YYYY-MM-DD formatted date string comparison)
  const todayStr = new Date().toISOString().split('T')[0]; // "2026-08-19"
  const todaySessions = mentorBookings.filter(b => b.date === todayStr && b.status === 'upcoming');

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-sans">Mentor Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Academic mentoring portal for <strong className="text-white font-semibold">{user?.name}</strong>.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/mentor/availability">
              <Button variant="outline" size="sm" icon={PlusCircle}>
                Add Availability
              </Button>
            </Link>
            <Link to="/mentor/profile">
              <Button variant="glass" size="sm" icon={UserCheck}>
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Upcoming Bookings"
            value={upcomingBookings.length}
            icon={Calendar}
            color="brand"
          />
          <StatCard
            title="Sessions Completed"
            value={completedBookings.length}
            icon={Award}
            color="emerald"
          />
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            color="amber"
          />
          <StatCard
            title="Average Rating"
            value={mentorProfile ? `${mentorProfile.rating}★` : '5.0★'}
            icon={Star}
            color="emerald"
            description={`${reviews.length} total reviews`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Schedules */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Today's appointments */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-500" />
                Today's Sessions
              </h3>
              {todaySessions.length === 0 ? (
                <div className="glass-panel p-6 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
                  No sessions scheduled for today ({todayStr}).
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySessions.map(b => (
                    <UpcomingSession key={b.id} booking={b} role="mentor" />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming bookings list */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                All Scheduled Bookings
              </h3>
              {upcomingBookings.length === 0 ? (
                <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
                  You have no upcoming tutoring sessions scheduled.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map(b => (
                    <UpcomingSession key={b.id} booking={b} role="mentor" />
                  ))}
                </div>
              )}
            </div>

            {/* Recent reviews list */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <Star className="w-5 h-5 text-brand-500" />
                Recent Student Reviews
              </h3>
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic pl-1">No student reviews received yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.slice(0, 4).map(r => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Timeline logs */}
          <div className="lg:col-span-1">
            <RecentActivity bookings={mentorBookings} role="mentor" />
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default MentorDashboard;
