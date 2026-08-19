import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import StatCard from '../components/dashboard/StatCard';
import UpcomingSession from '../components/dashboard/UpcomingSession';
import RecentActivity from '../components/dashboard/RecentActivity';
import MentorCard from '../components/mentors/MentorCard';
import BookingModal from '../components/booking/BookingModal';
import Modal from '../components/common/Modal';
import ReviewForm from '../components/reviews/ReviewForm';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { mentorService } from '../services/mentorService';
import { Calendar, CheckCircle2, Users, Star, Award, Compass, MessageSquarePlus } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const { bookings, submitReview, loading: appLoading, error: appError } = useContext(AppContext);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [bookingMentor, setBookingMentor] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch 3 popular mentors as recommendation cards
    mentorService.getMentors({ sortBy: 'rating' })
      .then(data => setRecommendedMentors(data.slice(0, 3)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Compute Student statistics
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  
  // Unique mentors connected
  const mentorsConnected = new Set(bookings.map(b => b.mentorId)).size;

  // Find bookings that are completed but don't have reviews yet
  const getUnreviewedBookings = () => {
    const reviews = JSON.parse(localStorage.getItem('cc_reviews') || '[]');
    return completedBookings.filter(b => !reviews.some(r => r.bookingId === b.id));
  };

  const unreviewedList = getUnreviewedBookings();

  const handleOpenReview = (booking) => {
    setReviewSuccess(false);
    setReviewBooking(booking);
  };

  const handleReviewSubmit = async (rating, comment) => {
    if (!reviewBooking) return;
    setReviewLoading(true);
    try {
      await submitReview(reviewBooking.id, rating, comment);
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewBooking(null);
        setReviewSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Welcome Area */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white font-sans">Student Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <strong className="text-white font-semibold">{user?.name}</strong>. Track your tutoring appointments and query ratings here.
          </p>
        </div>

        {appError && <ErrorMessage message={appError} />}

        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Upcoming Sessions"
            value={upcomingBookings.length}
            icon={Calendar}
            color="brand"
          />
          <StatCard
            title="Completed Sessions"
            value={completedBookings.length}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Mentors Connected"
            value={mentorsConnected}
            icon={Users}
            color="amber"
          />
          <StatCard
            title="Pending Reviews"
            value={unreviewedList.length}
            icon={Star}
            color={unreviewedList.length > 0 ? "rose" : "brand"}
            description={unreviewedList.length > 0 ? "Action required" : "All caught up!"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Session trackers & pending feedback */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Session list */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                Upcoming Bookings
              </h3>
              {upcomingBookings.length === 0 ? (
                <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400">
                  <p className="text-sm">You have no upcoming tutoring sessions scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map(b => (
                    <UpcomingSession key={b.id} booking={b} role="student" />
                  ))}
                </div>
              )}
            </div>

            {/* Unreviewed list banner alerts */}
            {unreviewedList.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-rose-400" />
                  Rate Completed Sessions
                </h4>
                <p className="text-xs text-slate-400">
                  Help improve the platform. Rate your recently completed tutoring sessions:
                </p>
                <div className="space-y-2">
                  {unreviewedList.map(b => (
                    <div key={b.id} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 text-xs">
                      <div>
                        <span className="font-semibold text-white">{b.mentorName}</span>
                        <span className="text-slate-400"> • {b.subject} on {b.date}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleOpenReview(b)} className="text-[10px] py-1 px-3">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Mentors */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-500" />
                Recommended Mentors
              </h3>
              {loading ? (
                <Loader message="Loading recommendations..." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedMentors.slice(0, 2).map(mentor => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      onBook={(m) => setBookingMentor(m)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Activities & Logs */}
          <div className="lg:col-span-1">
            <RecentActivity bookings={bookings} role="student" />
          </div>

        </div>

      </div>

      {/* Booking Dialog Modal */}
      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          isOpen={!!bookingMentor}
          onClose={() => setBookingMentor(null)}
        />
      )}

      {/* Review Dialog Modal */}
      {reviewBooking && (
        <Modal 
          isOpen={!!reviewBooking} 
          onClose={() => setReviewBooking(null)} 
          title={`Submit Feedback for ${reviewBooking.mentorName}`}
        >
          {reviewSuccess ? (
            <div className="text-center py-6 text-emerald-400 font-bold text-sm animate-pulse">
              Review submitted successfully! Thank you.
            </div>
          ) : (
            <ReviewForm
              mentorName={reviewBooking.mentorName}
              loading={reviewLoading}
              onSubmit={handleReviewSubmit}
            />
          )}
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default StudentDashboard;
