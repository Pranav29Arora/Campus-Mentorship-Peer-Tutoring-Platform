import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import { Calendar, ArrowRight, UserCheck } from 'lucide-react';
import Button from '../common/Button';

const MentorCard = ({ mentor, onBook }) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between h-full border border-slate-800 shadow-md">
      <div>
        
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-14 h-14 rounded-xl border border-slate-700 object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-sans font-bold text-base text-white truncate hover:text-brand-500 transition-colors">
              <Link to={`/mentor/${mentor.id}`}>{mentor.name}</Link>
            </h3>
            <p className="text-xs text-slate-400 font-medium truncate">
              {mentor.department} • {mentor.year === 4 ? '4th Year' : `${mentor.year}rd Year`}
            </p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mt-1.5">
              <RatingStars rating={mentor.rating} size={14} />
              <span className="text-xs font-bold text-amber-400">{mentor.rating}</span>
              <span className="text-[10px] text-slate-500">({mentor.totalSessions} sessions)</span>
            </div>

          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          "{mentor.bio}"
        </p>

        {/* Expertise tags */}
        <div className="mb-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Expertise</p>
          <div className="flex flex-wrap gap-1">
            {mentor.expertise.map(exp => (
              <span 
                key={exp} 
                className="text-[10px] px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full font-medium"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>

        {/* Subjects tags */}
        <div className="mb-6">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Subjects</p>
          <div className="flex flex-wrap gap-1">
            {mentor.subjects.map(sub => (
              <span 
                key={sub} 
                className="text-[10px] px-2.5 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 rounded-full font-medium"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-800/80">
        <Link to={`/mentor/${mentor.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs" icon={ArrowRight}>
            View Profile
          </Button>
        </Link>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => onBook(mentor)}
          className="flex-1 text-xs"
          icon={Calendar}
        >
          Book Session
        </Button>
      </div>

    </div>
  );
};

export default MentorCard;
