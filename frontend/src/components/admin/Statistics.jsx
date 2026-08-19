import React from 'react';
import { Award, BookOpen, BarChart3, TrendingUp } from 'lucide-react';

const Statistics = ({ stats }) => {
  const { summary, charts } = stats;

  const getPercentage = (value, total) => {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Graphs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Graph 1: Students vs Mentors Ratio */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-sm text-left">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            Users Distribution Ratio
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Students</span>
                <span className="text-white">{summary.totalStudents} ({getPercentage(summary.totalStudents, summary.totalStudents + summary.totalMentors)})</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3">
                <div 
                  className="bg-brand-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: getPercentage(summary.totalStudents, summary.totalStudents + summary.totalMentors) }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Mentors</span>
                <span className="text-white">{summary.totalMentors} ({getPercentage(summary.totalMentors, summary.totalStudents + summary.totalMentors)})</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3">
                <div 
                  className="bg-amber-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: getPercentage(summary.totalMentors, summary.totalStudents + summary.totalMentors) }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Graph 2: Popular Subjects Bar Gauges */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-sm text-left">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" />
            Top Booked Tutoring Subjects
          </h4>
          <div className="space-y-3">
            {charts.popularSubjects.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No bookings recorded yet.</p>
            ) : (
              charts.popularSubjects.map((sub, idx) => {
                const colors = ['bg-brand-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-pink-500'];
                return (
                  <div key={sub.subject}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{sub.subject}</span>
                      <span className="text-slate-400">{sub.count} bookings</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div 
                        className={`${colors[idx % colors.length]} h-2 rounded-full`} 
                        style={{ width: getPercentage(sub.count, summary.totalBookings) }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Graph 3: Timeline sessions activity line visual */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-sm text-left">
        <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-500" />
          Sessions Activity History
        </h4>
        <div className="flex items-end justify-between h-40 gap-4 pt-4 border-b border-slate-800 px-4">
          {charts.sessionsOverTime.length === 0 ? (
            <div className="w-full text-center text-xs text-slate-500 italic pb-16">
              No historical data available.
            </div>
          ) : (
            charts.sessionsOverTime.map((pt) => (
              <div key={pt.date} className="flex-1 flex flex-col items-center group">
                <span className="text-[10px] text-brand-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  {pt.count}
                </span>
                <div 
                  className="w-full bg-brand-500/20 group-hover:bg-brand-500 border border-brand-500/30 rounded-t-md transition-all duration-300"
                  style={{ height: `${(pt.count / Math.max(...charts.sessionsOverTime.map(p => p.count), 1)) * 100}px` }}
                />
                <span className="text-[9px] text-slate-500 font-medium block mt-2 whitespace-nowrap">
                  {pt.date}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Statistics;
