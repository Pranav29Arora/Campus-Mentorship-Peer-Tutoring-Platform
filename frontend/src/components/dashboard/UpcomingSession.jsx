import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Clock, User, BookOpen } from 'lucide-react';
import Button from '../common/Button';

const UpcomingSession = ({ booking, role }) => {
  const videoLink = `/${role}/video/${booking.id}`;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-brand-500/25 relative overflow-hidden bg-gradient-to-br from-dark-card to-indigo-950/20 shadow-md">
      {/* Decorative background accent */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Info Area */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/25 font-bold uppercase tracking-wider">
              {booking.subject}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider">
              Upcoming
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <User className="w-4 h-4 text-brand-500" />
              <p className="truncate">
                {role === 'student' ? 'Mentor: ' : 'Student: '}
                <strong className="text-white font-medium">
                  {role === 'student' ? booking.mentorName : booking.studentName || 'Junior Student'}
                </strong>
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {booking.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 sm:self-center">
          <Link to={videoLink}>
            <Button variant="primary" size="sm" icon={Video} className="shadow-lg shadow-indigo-500/10">
              Join Call
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UpcomingSession;
