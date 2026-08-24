import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Clock, User, BookOpen } from 'lucide-react';
import Button from '../common/Button';

const UpcomingSession = ({ booking, role }) => {
  const videoLink = `/${role}/video/${booking.id}`;

  return (
    <div className="bg-white p-6 rounded-3xl border border-brand-200 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Decorative background accent */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-brand-50 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        
        {/* Info Area */}
        <div className="space-y-2.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 font-bold uppercase tracking-wider">
              {booking.subject}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider">
              Upcoming
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <User className="w-4 h-4 text-brand-600" />
              <p className="truncate">
                {role === 'student' ? 'Mentor: ' : 'Student: '}
                <strong className="text-slate-900 font-bold">
                  {role === 'student' ? booking.mentorName : booking.studentName || 'Junior Student'}
                </strong>
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                {booking.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 sm:self-center">
          <Link to={videoLink}>
            <Button variant="primary" size="sm" icon={Video} className="shadow-md shadow-brand-500/25 font-bold">
              Join Call
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UpcomingSession;
