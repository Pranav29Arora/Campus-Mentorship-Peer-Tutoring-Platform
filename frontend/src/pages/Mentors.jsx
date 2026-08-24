import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MentorFilters from '../components/mentors/MentorFilters';
import MentorCard from '../components/mentors/MentorCard';
import BookingModal from '../components/booking/BookingModal';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, AlertTriangle, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';

const Mentors = () => {
  const { mentors, fetchMentors, loading, error } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || '',
    subject: searchParams.get('subject') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || ''
  });

  // Modal selector State
  const [bookingMentor, setBookingMentor] = useState(null);
  const [authError, setAuthError] = useState('');

  // Sync searchParams with filters state
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      department: searchParams.get('department') || '',
      subject: searchParams.get('subject') || '',
      minRating: searchParams.get('minRating') || '',
      sortBy: searchParams.get('sortBy') || ''
    });
  }, [searchParams]);

  // Load mentors list when filters change
  useEffect(() => {
    fetchMentors(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handleOpenBooking = (mentor) => {
    setAuthError('');
    if (!user) {
      setAuthError('You must sign in to your student profile to book a tutoring session.');
      return;
    }
    if (user.role !== 'student') {
      setAuthError('Only student accounts are authorized to book tutoring slots.');
      return;
    }
    setBookingMentor(mentor);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner Title */}
        <div className="text-left space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Verified Senior Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans flex items-center gap-3">
            Discover Campus Mentors
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Find and schedule 1-on-1 calls with experienced seniors from your department for course guidance, viva review, and interview prep.
          </p>
        </div>

        {authError && (
          <div className="p-4 mb-6 rounded-2xl border border-rose-200 bg-rose-50 text-left text-sm text-rose-700 font-medium flex items-center gap-3 shadow-sm animate-bounce">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Filter panel */}
          <div className="lg:col-span-1">
            <MentorFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>

          {/* Right Column: Listing results */}
          <div className="lg:col-span-3">
            {loading ? (
              <Loader message="Querying matching mentor profiles..." />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => fetchMentors(filters)} />
            ) : mentors.length === 0 ? (
              <EmptyState
                title="No Mentors Match Filters"
                message="We could not find any active senior profiles matching your criteria. Try adjusting keywords or clearing filters."
                actionButton={
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map(mentor => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onBook={handleOpenBooking}
                  />
                ))}
              </div>
            )}
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

      <Footer />
    </div>
  );
};

export default Mentors;
