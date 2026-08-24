import React from 'react';
import { Calendar, Award, CheckCircle, PlusCircle } from 'lucide-react';

const RecentActivity = ({ bookings, role }) => {
  const getActivities = () => {
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
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
        });
      } else if (b.status === 'upcoming') {
        activities.push({
          id: `act-book-${b.id}`,
          message: role === 'student'
            ? `You scheduled a session with ${b.mentorName} for ${b.date}.`
            : `New booking received from student for ${b.date}.`,
          time: 'New',
          icon: Calendar,
          color: 'text-brand-600 bg-brand-50 border-brand-200'
        });
      }
    });

    if (activities.length === 0) {
      return [
        {
          id: 'act-init',
          message: 'Welcome to CampusConnect! Browse mentors to start scheduling sessions.',
          time: 'Now',
          icon: PlusCircle,
          color: 'text-brand-600 bg-brand-50 border-brand-200'
        }
      ];
    }

    return activities.slice(0, 5);
  };

  const activeLogs = getActivities();

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-sans font-bold text-slate-900 text-base">Recent Activities</h3>
      
      <div className="relative border-l border-slate-200 pl-4 space-y-5 ml-2">
        {activeLogs.map((log) => {
          const Icon = log.icon;
          return (
            <div key={log.id} className="relative flex items-start gap-3">
              {/* Timeline dot */}
              <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border shadow-xs ${log.color}`}>
                <Icon className="w-3 h-3" />
              </span>
              
              <div className="text-left min-w-0">
                <p className="text-xs text-slate-700 font-sans font-medium leading-relaxed">{log.message}</p>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">{log.time}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default RecentActivity;
