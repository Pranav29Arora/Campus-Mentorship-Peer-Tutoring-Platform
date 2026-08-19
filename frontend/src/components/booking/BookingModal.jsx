import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import AvailabilitySlot from './AvailabilitySlot';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';

const BookingModal = ({ mentor, isOpen, onClose }) => {
  const { fetchAvailability, createBooking } = useContext(AppContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);

  useEffect(() => {
    if (isOpen && mentor) {
      loadSlots();
      setSelectedSlot(null);
      setSuccessBooking(null);
      setError(null);
    }
  }, [isOpen, mentor]);

  const loadSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAvailability(mentor.id);
      setSlots(data);
    } catch (err) {
      setError('Unable to load availability slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBookingLoading(true);
    setError(null);
    try {
      const booking = await createBooking(mentor.id, selectedSlot.id);
      setSuccessBooking(booking);
      // Reload slots to show booked state
      await loadSlots();
    } catch (err) {
      setError(err.message || 'An error occurred during booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(groupedSlots).sort();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book a Session with ${mentor?.name}`} size="lg">
      {loading ? (
        <Loader message="Loading mentor availability..." />
      ) : successBooking ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Booking Confirmed!</h4>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
            Your tutoring session on **{successBooking.date}** at **{successBooking.startTime}** is scheduled.
          </p>
          <div className="glass-panel p-4 rounded-xl border border-slate-800 text-left max-w-md mx-auto mb-6 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-brand-500" />
              <span className="text-slate-300">Mentor: **{mentor.name}**</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span className="text-slate-300">Date: {successBooking.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              <span className="text-slate-300">Time: {successBooking.startTime} - {successBooking.endTime}</span>
            </div>
          </div>
          <Button variant="secondary" onClick={onClose} className="px-6">
            Close & Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {error && <ErrorMessage message={error} />}

          {slots.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">No upcoming availability slots listed by this mentor.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {dates.map(date => (
                <div key={date} className="space-y-2">
                  <h4 className="text-xs font-bold text-brand-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    {date}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedSlots[date].map(slot => (
                      <AvailabilitySlot
                        key={slot.id}
                        slot={slot}
                        onSelect={setSelectedSlot}
                        isSelected={selectedSlot?.id === slot.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking Confirmation checkout */}
          {selectedSlot && (
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Selected Slot</p>
                <p className="text-xs font-semibold text-white">
                  {selectedSlot.date} @ {selectedSlot.startTime}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedSlot(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleBook} loading={bookingLoading}>
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;
