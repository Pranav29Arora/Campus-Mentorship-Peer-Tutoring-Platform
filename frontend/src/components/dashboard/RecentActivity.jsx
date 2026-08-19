import React from 'react';
import { Calendar, Award, CheckCircle, PlusCircle } from 'lucide-react';

const RecentActivity = ({ bookings, role }) => {
  const getActivities = () => {
    // Generate a set of activities dynamically based on completed and upcoming bookings
    const activities = [];

    bookings.forEach(b => {
      if (b.status === 'completed') {
        activities.push({
          id: `act-comp-${b.id}`,
          message: role === 'student'
            ? `Your session with ${b.mentorName} on ${b.subject} was completed.`
            : `Your session with Student ${b.studentName || 'Peer'} was completed.`,
          time: 'Recently',
          icon: CheckCircle,
          color: 'text-emerald-500 bg-emerald-500/10'
        });
      } else if (b.status === 'upcoming') {
        activities.push({
          id: `act-book-${b.id}`,
          message: role === 'student'
            ? `You scheduled a session with ${b.mentorName} for ${b.date}.`
            : `New booking received from student for ${b.date}.`,
          time: 'New',
          icon: Calendar,
          color: 'text-brand-400 bg-brand-500/10'
        });
      }
    });

    // Fallback if no records exist
    if (activities.length === 0) {
      return [
        {
          id: 'act-init',
          message: 'Welcome to CampusConnect! Browse mentors to start scheduling sessions.',
          time: 'Now',
          icon: PlusCircle,
          color: 'text-brand-400 bg-brand-500/10'
        }
      ];
    }

    return activities.slice(0, 5);
  };

  const activeLogs = getActivities();

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
      <h3 className="font-sans font-bold text-white text-base">Recent Activities</h3>
      
      <div className="relative border-l border-slate-850 pl-4 space-y-5 ml-2">
        {activeLogs.map((log) => {
          const Icon = log.icon;
          return (
            <div key={log.id} className="relative flex items-start gap-3">
              {/* Timeline dot */}
              <span className={`absolute left-[-25px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border border-dark-bg ${log.color}`}>
                <Icon className="w-2.5 h-2.5" />
              </span>
              
              <div className="text-left min-w-0">
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{log.message}</p>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">{log.time}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default RecentActivity;
