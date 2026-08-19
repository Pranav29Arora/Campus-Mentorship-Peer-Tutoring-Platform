import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import RatingStars from '../components/mentors/RatingStars';
import ReviewList from '../components/reviews/ReviewList';
import BookingModal from '../components/booking/BookingModal';
import { mentorService } from '../services/mentorService';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Star, BookOpen, ChevronLeft, Award, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';

const MentorDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    loadMentorProfile();
  }, [id]);

  const loadMentorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mentorService.getMentorById(id);
      setMentor(data);
    } catch (err) {
      setError(err.message || 'Failed to load mentor details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = () => {
    setBookingError('');
    if (!user) {
      setBookingError('You must sign in as a student to schedule tutoring.');
      return;
    }
    if (user.role !== 'student') {
      setBookingError('Only student accounts are authorized to book tutoring.');
      return;
    }
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-bg">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader message="Loading mentor profile details..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-bg">
        <Navbar />
        <div className="flex-1 flex items-center justify-center max-w-md mx-auto px-4">
          <ErrorMessage message={error} onRetry={loadMentorProfile} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        
        {/* Back Link */}
        <Link to="/mentors" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Discover Mentors
        </Link>

        {bookingError && (
          <div className="glass-panel p-4 mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-sm text-rose-400">
            {bookingError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Center: Profile Bio & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Profile Info Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-24 h-24 rounded-2xl border border-slate-700 object-cover flex-shrink-0"
                />
                <div className="text-center sm:text-left space-y-1.5 min-w-0">
                  <h2 className="text-2xl font-extrabold text-white font-sans">{mentor.name}</h2>
                  <p className="text-sm font-semibold text-brand-400">
                    {mentor.department} • {mentor.year}th Year
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center sm:justify-start gap-2.5">
                    <RatingStars rating={mentor.rating} size={16} />
                    <span className="text-sm font-bold text-amber-400">{mentor.rating}</span>
                    <span className="text-xs text-slate-500">• {mentor.totalSessions} tutoring sessions completed</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Biography</h4>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{mentor.bio}"
                </p>
              </div>

              {/* Tags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-850">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Competencies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.subjects.map(sub => (
                      <span key={sub} className="text-xs px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-full font-medium">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Expertise</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.map(exp => (
                      <span key={exp} className="text-xs px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Peer Reviews section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-500" />
                Student Reviews ({mentor.reviews?.length || 0})
              </h3>
              <ReviewList reviews={mentor.reviews} />
            </div>

          </div>

          {/* Right Column: Interactive Availability Scheduling widgets */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-sm space-y-6 sticky top-24">
              <div className="pb-4 border-b border-slate-850">
                <h3 className="font-sans font-bold text-white text-base">Schedule Tutoring</h3>
                <p className="text-xs text-slate-400 mt-1">Book an available slot directly below.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total sessions completed:</span>
                  <span className="font-bold text-white">{mentor.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Avg. Student Rating:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    {mentor.rating} / 5.0
                  </span>
                </div>
              </div>

              <Button 
                variant="primary" 
                onClick={handleBookClick} 
                className="w-full py-3"
                icon={Calendar}
              >
                Schedule Session
              </Button>

              <div className="rounded-xl border border-slate-800/80 p-3 bg-slate-900/20 text-[11px] text-slate-500 leading-normal flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                Double booking check will automatically run against your active calendar on checkout.
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Booking Dialog Modal */}
      {mentor && (
        <BookingModal
          mentor={mentor}
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default MentorDetails;
