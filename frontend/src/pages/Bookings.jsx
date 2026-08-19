import React, { useContext, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import UpcomingSession from '../components/dashboard/UpcomingSession';
import Button from '../components/common/Button';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { Calendar, Clock, Video, CheckCircle2, XCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const { bookings, cancelBooking, completeBooking, loading, error } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('upcoming');

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'upcoming') {
      return b.status === 'upcoming';
    }
    return b.status === 'completed' || b.status === 'cancelled';
  });

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this tutoring session?')) {
      try {
        await cancelBooking(bookingId);
      } catch (err) {
        alert(err.message || 'Cancellation failed.');
      }
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await completeBooking(bookingId);
    } catch (err) {
      alert(err.message || 'Update failed.');
    }
  };

  const tabClass = (tab) => 
    `flex-1 text-center py-3 text-sm font-semibold transition-all duration-300 border-b-2 ${
      activeTab === tab
        ? 'border-brand-500 text-brand-400 font-bold'
        : 'border-slate-800 text-slate-400 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white font-sans flex items-center gap-2">
            <Calendar className="w-8 h-8 text-brand-500" />
            Your Bookings Calendar
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track scheduled 1-to-1 video mentoring sessions and completed history log.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Tabs */}
        <div className="flex w-full mb-6">
          <button onClick={() => setActiveTab('upcoming')} className={tabClass('upcoming')}>
            Upcoming Sessions ({bookings.filter(b => b.status === 'upcoming').length})
          </button>
          <button onClick={() => setActiveTab('history')} className={tabClass('history')}>
            Session History ({bookings.filter(b => b.status !== 'upcoming').length})
          </button>
        </div>

        {/* Listings */}
        {loading ? (
          <Loader message="Fetching bookings data..." />
        ) : filteredBookings.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
            <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm mb-4">No appointments found under this tab.</p>
            {user?.role === 'student' && activeTab === 'upcoming' && (
              <Link to="/mentors">
                <Button variant="primary" size="sm">Find a Mentor</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isUpcoming = b.status === 'upcoming';
              const isCompleted = b.status === 'completed';
              const isCancelled = b.status === 'cancelled';
              const role = user?.role;

              return (
                <div 
                  key={b.id} 
                  className={`glass-panel p-6 rounded-2xl border transition-all ${
                    isUpcoming 
                      ? 'border-brand-500/20' 
                      : 'border-slate-850 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    {/* Details Info */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/25 font-bold uppercase tracking-wider">
                          {b.subject}
                        </span>
                        
                        {/* Status Badges */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : isCancelled
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                          {isCancelled && <XCircle className="w-3 h-3" />}
                          {isUpcoming && <Clock className="w-3 h-3" />}
                          {b.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-300">
                        <p className="text-sm">
                          {role === 'student' ? 'Mentor: ' : 'Student: '}
                          <strong className="text-white font-semibold">
                            {role === 'student' ? b.mentorName : b.studentName || 'Junior Student'}
                          </strong>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {b.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {b.startTime} - {b.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 self-stretch sm:self-center">
                      {isUpcoming && (
                        <>
                          <Link to={`/${role}/video/${b.id}`} className="flex-1 sm:flex-initial">
                            <Button variant="primary" size="sm" icon={Video} className="w-full">
                              Join Call
                            </Button>
                          </Link>
                          
                          {role === 'student' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancel(b.id)}
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Button 
                              variant="glass" 
                              size="sm" 
                              onClick={() => handleComplete(b.id)}
                              icon={CheckCircle2}
                            >
                              Mark Completed
                            </Button>
                          )}
                        </>
                      )}
                      
                      {isCompleted && role === 'student' && (
                        <span className="text-xs text-slate-500 italic font-medium px-2 py-1">
                          Reviewed or ready to review on Dashboard
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default Bookings;
