import React from 'react';
import RatingStars from '../mentors/RatingStars';
import { Calendar } from 'lucide-react';

const ReviewCard = ({ review }) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-sm text-left">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h5 className="text-sm font-bold text-white">{review.studentName}</h5>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={review.rating} size={12} />
            <span className="text-[10px] text-amber-400 font-bold">{review.rating}.0</span>
          </div>
        </div>
        {review.createdAt && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      {review.comment && (
        <p className="text-xs text-slate-300 italic mt-3 leading-relaxed border-l-2 border-slate-800 pl-3">
          "{review.comment}"
        </p>
      )}
    </div>
  );
};

export default ReviewCard;
