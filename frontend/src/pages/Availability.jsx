import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { SUBJECTS } from '../components/mentors/MentorFilters';
import { Calendar, Clock, Trash2, CheckCircle2, Lock, PlusCircle } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white font-sans flex items-center gap-2">
            <Calendar className="w-8 h-8 text-brand-500" />
            Manage Availability Slots
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publish tutoring calendar slots. Students can browse and book slots instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form to Add Slots */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4.5 h-4.5 text-brand-500" />
                Add New Slot
              </h3>

              {formError && <ErrorMessage message={formError} />}

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
                    >
                      {times.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
                    >
                      {times.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
                  >
                    {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={formLoading}
                  className="w-full mt-2"
                >
                  Publish Slot
                </Button>

              </form>
            </div>
          </div>

          {/* List of Current Slots */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-white font-sans">Active Calendar Slots</h3>
            
            {loading ? (
              <Loader message="Fetching calendar slots..." />
            ) : availability.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
                No availability slots published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availability.map(slot => {
                  const isBooked = slot.status === 'booked';
                  return (
                    <div 
                      key={slot.id} 
                      className={`glass-panel p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                        isBooked 
                          ? 'border-emerald-500/20 bg-emerald-500/5' 
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 text-left">
                        <Clock className={`w-4 h-4 mt-0.5 ${isBooked ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-semibold text-white">{slot.startTime} - {slot.endTime}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{slot.date} • {slot.subject}</p>
                        </div>
                      </div>

                      {isBooked ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          Booked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
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
