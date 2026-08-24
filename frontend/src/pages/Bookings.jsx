import React, { useContext, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import UpcomingSession from '../components/dashboard/UpcomingSession';
import Button from '../components/common/Button';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { Calendar, Clock, Video, CheckCircle2, XCircle, Award, Sparkles } from 'lucide-react';
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
    `flex-1 text-center py-3.5 text-sm font-bold transition-all duration-200 border-b-2 cursor-pointer ${
      activeTab === tab
        ? 'border-brand-600 text-brand-600 bg-white'
        : 'border-slate-200 text-slate-500 hover:text-slate-800 bg-slate-50/50'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Active Schedule
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans flex items-center gap-3">
            Your Bookings Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track scheduled 1-to-1 video mentoring sessions and completed tutoring history.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Tabs */}
        <div className="flex w-full mb-6 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
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
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium mb-4">No appointments found under this tab.</p>
            {user?.role === 'student' && activeTab === 'upcoming' && (
              <Link to="/mentors">
                <Button variant="primary" size="sm" className="font-bold">Find a Mentor</Button>
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
                  className={`bg-white p-6 rounded-3xl border transition-all duration-200 shadow-sm ${
                    isUpcoming 
                      ? 'border-brand-200 hover:shadow-md' 
                      : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    {/* Details Info */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 font-bold uppercase tracking-wider">
                          {b.subject}
                        </span>
                        
                        {/* Status Badges */}
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isCompleted 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isCancelled && <XCircle className="w-3 h-3 text-rose-600" />}
                          {isUpcoming && <Clock className="w-3 h-3 text-indigo-600" />}
                          {b.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600">
                        <p className="text-sm">
                          {role === 'student' ? 'Mentor: ' : 'Student: '}
                          <strong className="text-slate-900 font-bold">
                            {role === 'student' ? b.mentorName : b.studentName || 'Junior Student'}
                          </strong>
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap pt-0.5">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-brand-600" />
                            {b.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-600" />
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
                            <Button variant="primary" size="sm" icon={Video} className="w-full font-bold shadow-md shadow-brand-500/25">
                              Join Call
                            </Button>
                          </Link>
                          
                          {role === 'student' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancel(b.id)}
                              className="font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleComplete(b.id)}
                              icon={CheckCircle2}
                              className="font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
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
