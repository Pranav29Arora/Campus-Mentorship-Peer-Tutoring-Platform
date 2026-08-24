import React from 'react';
import RatingStars from '../mentors/RatingStars';
import { Calendar } from 'lucide-react';

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h5 className="text-sm font-bold text-slate-800">{review.studentName}</h5>
          <div className="flex items-center gap-1.5 mt-1">
            <RatingStars rating={review.rating} size={12} />
            <span className="text-xs text-amber-500 font-bold">{review.rating}.0</span>
          </div>
        </div>
        {review.createdAt && (
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      {review.comment && (
        <p className="text-xs text-slate-600 italic mt-3 leading-relaxed border-l-2 border-brand-300 pl-3 bg-slate-50 py-1.5 rounded-r-lg">
          "{review.comment}"
        </p>
      )}
    </div>
  );
};

export default ReviewCard;
