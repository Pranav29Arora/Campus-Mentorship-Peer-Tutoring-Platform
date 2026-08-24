import React from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

const BookingTable = ({ bookings = [] }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Mentor</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {bookings.map((booking) => {
              const isCompleted = booking.status === 'completed';
              const isCancelled = booking.status === 'cancelled';
              const isUpcoming = booking.status === 'upcoming';

              return (
                <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{booking.studentName || 'Junior Student'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{booking.mentorName}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 font-bold uppercase tracking-wider">
                      {booking.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      {booking.date}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 w-max uppercase ${
                      isCompleted 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isCancelled
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}>
                      {isCompleted && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                      {isCancelled && <XCircle className="w-3 h-3 text-rose-600" />}
                      {isUpcoming && <Clock className="w-3 h-3 text-brand-600" />}
                      <span>{booking.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;
