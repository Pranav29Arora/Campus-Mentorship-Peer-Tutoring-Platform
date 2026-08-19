import React from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

const BookingTable = ({ bookings = [] }) => {
  return (
    <div className="glass-panel border-slate-800 rounded-2xl overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-850 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Mentor</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/50 text-slate-300 text-sm">
            {bookings.map((booking) => {
              const isCompleted = booking.status === 'completed';
              const isCancelled = booking.status === 'cancelled';
              const isUpcoming = booking.status === 'upcoming';

              return (
                <tr key={booking.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{booking.studentName || 'Junior Student'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-300">{booking.mentorName}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/25 font-bold uppercase tracking-wider">
                      {booking.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400 flex items-center gap-1 mt-2.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    {booking.date}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 w-max ${
                      isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : isCancelled
                        ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                    }`}>
                      {isCompleted && <CheckCircle className="w-3 h-3" />}
                      {isCancelled && <XCircle className="w-3 h-3" />}
                      {isUpcoming && <Clock className="w-3 h-3" />}
                      <span className="capitalize">{booking.status}</span>
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
