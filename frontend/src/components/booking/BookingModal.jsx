import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import AvailabilitySlot from './AvailabilitySlot';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import { Calendar, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h4>
          <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
            Your tutoring session on <strong className="text-slate-900">{successBooking.date}</strong> at <strong className="text-slate-900">{successBooking.startTime}</strong> is scheduled.
          </p>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left max-w-md mx-auto mb-6 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span className="text-slate-700">Mentor: <strong className="text-slate-900">{mentor.name}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span className="text-slate-700">Date: <strong className="text-slate-900">{successBooking.date}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span className="text-slate-700">Time: <strong className="text-slate-900">{successBooking.startTime} - {successBooking.endTime}</strong></span>
            </div>
          </div>
          <Button variant="primary" onClick={onClose} className="px-8 font-bold">
            Close & Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {error && <ErrorMessage message={error} />}

          {dates.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <p className="font-semibold text-slate-700">No Open Slots Available</p>
              <p className="text-xs text-slate-400 mt-1">This mentor hasn't published upcoming open slots yet.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-1">
              {dates.map((date) => (
                <div key={date} className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    {date}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {groupedSlots[date].map((slot) => (
                      <AvailabilitySlot
                        key={slot.id}
                        slot={slot}
                        isSelected={selectedSlot?.id === slot.id}
                        onSelect={(s) => setSelectedSlot(s)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {dates.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-slate-500 font-medium">
                {selectedSlot ? (
                  <span>Selected: <strong className="text-brand-600 font-bold">{selectedSlot.date} ({selectedSlot.startTime} - {selectedSlot.endTime})</strong></span>
                ) : (
                  <span>Please select an available slot above</span>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleBook}
                  disabled={!selectedSlot}
                  loading={bookingLoading}
                  className="flex-1 sm:flex-none font-bold"
                >
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
