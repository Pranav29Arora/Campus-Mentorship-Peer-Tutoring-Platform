import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { SUBJECTS } from '../components/mentors/MentorFilters';
import { Calendar, Clock, Trash2, CheckCircle2, Lock, PlusCircle, Sparkles } from 'lucide-react';

const Availability = () => {
  const { user } = useContext(AuthContext);
  const { availability, fetchAvailability, addAvailabilitySlot, deleteAvailabilitySlot, loading, error, clearError } = useContext(AppContext);
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user && user.mentorId) {
      fetchAvailability(user.mentorId);
    }
  }, [user]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!date || !startTime || !endTime || !subject) {
      setFormError('Please fill in all form details.');
      return;
    }

    setFormLoading(true);
    try {
      await addAvailabilitySlot({
        date,
        startTime,
        endTime,
        subject
      });
      // Reset form
      setDate('');
    } catch (err) {
      setFormError(err.message || 'Failed to create availability slot.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteAvailabilitySlot(slotId);
    } catch (err) {
      alert(err.message || 'Failed to delete slot.');
    }
  };

  const times = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Scheduling Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans flex items-center gap-3">
            Manage Availability Slots
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish tutoring calendar slots. Students can browse and book available slots instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form to Add Slots */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4.5 h-4.5 text-brand-600" />
                Add New Slot
              </h3>

              {formError && <ErrorMessage message={formError} />}

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Start Time</label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      {times.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">End Time</label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      {times.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subject Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 text-sm font-semibold text-slate-800 cursor-pointer"
                  >
                    {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={formLoading}
                  className="w-full mt-2 font-bold shadow-md shadow-brand-500/25"
                >
                  Publish Slot
                </Button>

              </form>
            </div>
          </div>

          {/* List of Current Slots */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-sans">Active Calendar Slots</h3>
            
            {loading ? (
              <Loader message="Fetching calendar slots..." />
            ) : availability.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 text-slate-500 text-sm shadow-sm font-medium">
                No availability slots published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availability.map(slot => {
                  const isBooked = slot.status === 'booked';
                  return (
                    <div 
                      key={slot.id} 
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 ${
                        isBooked 
                          ? 'border-emerald-200 bg-emerald-50/60 shadow-xs' 
                          : 'border-slate-200 bg-white shadow-xs hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 text-left">
                        <Clock className={`w-4 h-4 mt-0.5 ${isBooked ? 'text-emerald-600' : 'text-brand-600'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{slot.startTime} - {slot.endTime}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{slot.date} • {slot.subject}</p>
                        </div>
                      </div>

                      {isBooked ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 uppercase">
                          <Lock className="w-3 h-3" />
                          Booked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Availability;
