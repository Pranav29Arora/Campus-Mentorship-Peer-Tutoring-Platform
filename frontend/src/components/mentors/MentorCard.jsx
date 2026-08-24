import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import { Calendar, ArrowRight, Sparkles, Award } from 'lucide-react';
import Button from '../common/Button';

const MentorCard = ({ mentor, onBook }) => {
  return (
    <div className="bg-white hover:bg-white rounded-2xl p-6 flex flex-col justify-between h-full border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 transform hover:-translate-y-1.5 group">
      <div>
        
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-14 h-14 rounded-2xl border-2 border-brand-100 object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white" title="Available for booking" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-sans font-bold text-base text-slate-800 truncate group-hover:text-brand-600 transition-colors">
              <Link to={`/mentor/${mentor.id}`}>{mentor.name}</Link>
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {mentor.department} • <span className="text-brand-600 font-semibold">{mentor.year === 4 ? '4th Year' : `${mentor.year}rd Year`}</span>
            </p>
            
            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <RatingStars rating={mentor.rating} size={14} />
              <span className="text-xs font-bold text-amber-500">{mentor.rating}</span>
              <span className="text-[11px] text-slate-400 font-medium">({mentor.totalSessions} sessions)</span>
            </div>

          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 italic">
          "{mentor.bio}"
        </p>

        {/* Expertise tags */}
        <div className="mb-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-500" />
            Top Expertise
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mentor.expertise.map(exp => (
              <span 
                key={exp} 
                className="text-[11px] px-2.5 py-1 bg-brand-50 border border-brand-200/80 text-brand-700 rounded-lg font-semibold"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>

        {/* Subjects tags */}
        <div className="mb-5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Subjects</p>
          <div className="flex flex-wrap gap-1.5">
            {mentor.subjects.map(sub => (
              <span 
                key={sub} 
                className="text-[11px] px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md font-medium"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-4 border-t border-slate-100">
        <Link to={`/mentor/${mentor.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs font-bold" icon={ArrowRight}>
            View Profile
          </Button>
        </Link>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => onBook(mentor)}
          className="flex-1 text-xs font-bold"
          icon={Calendar}
        >
          Book Session
        </Button>
      </div>

    </div>
  );
};

export default MentorCard;
