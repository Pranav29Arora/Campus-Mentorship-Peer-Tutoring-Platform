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
import { Calendar, Clock, Users, Star, Award, PlusCircle, UserCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mentorService } from '../services/mentorService';

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { bookings, availability, fetchAvailability } = useContext(AppContext);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (user && user.mentorId) {
      // Load mentor's profile stats & reviews from service
      mentorService.getMentorById(user.mentorId)
        .then(profile => {
          setMentorProfile(profile);
          if (profile.reviews) {
            setReviews(profile.reviews);
          }
        })
        .catch(err => console.error('Failed to load mentor stats:', err));

      // Fetch availability slots
      fetchAvailability(user.mentorId);
    }
  }, [user, bookings]);

  // Compute Mentor statistics
  const mentorBookings = bookings.filter(b => b.mentorId === user?.mentorId);
  const completedBookings = mentorBookings.filter(b => b.status === 'completed');
  
  // Convert unbooked availability slots into pseudo-bookings
  const unbookedPseudoBookings = (availability || [])
    .filter(slot => slot.status === 'available')
    .map(slot => ({
      id: slot.id,
      mentorId: slot.mentorId,
      studentId: '',
      studentName: 'Open Slot (No Student Yet)',
      subject: slot.subject,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'upcoming'
    }));

  // Combine real booked sessions and unbooked slots
  const allScheduled = [...mentorBookings.filter(b => b.status === 'upcoming'), ...unbookedPseudoBookings];
  
  // Sort by date and startTime
  allScheduled.sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    if (dateDiff !== 0) return dateDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  const upcomingBookings = allScheduled;

  // Unique students connected
  const totalStudents = new Set(mentorBookings.map(b => b.studentId).filter(Boolean)).size;

  // Filter today's sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = allScheduled.filter(b => b.date === todayStr);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Mentor Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">Mentor Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Academic mentoring portal for <strong className="text-slate-800 font-bold">{user?.name}</strong>. Manage bookings and publish time slots.
            </p>
          </div>
          
          <div className="flex gap-2.5">
            <Link to="/mentor/availability">
              <Button variant="primary" size="sm" icon={PlusCircle} className="font-bold shadow-md shadow-brand-500/25">
                Add Availability
              </Button>
            </Link>
            <Link to="/mentor/profile">
              <Button variant="outline" size="sm" icon={UserCheck} className="font-bold">
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
              <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                Today's Sessions
              </h3>
              {todaySessions.length === 0 ? (
                <div className="bg-white p-6 text-center rounded-3xl border border-slate-200 text-slate-500 text-sm shadow-sm font-medium">
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
              <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                All Scheduled Bookings
              </h3>
              {upcomingBookings.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 text-slate-500 text-sm shadow-sm font-medium">
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
              <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
                <Star className="w-5 h-5 text-brand-600" />
                Recent Student Reviews
              </h3>
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic pl-1">No student reviews received yet.</p>
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
