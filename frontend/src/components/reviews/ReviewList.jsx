import React from 'react';
import ReviewCard from './ReviewCard';
import { Award } from 'lucide-react';

const ReviewList = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 glass-panel border-slate-800 rounded-2xl p-6">
        <Award className="w-10 h-10 text-slate-700 mx-auto mb-2" />
        <p className="text-sm">No reviews submitted yet for this mentor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default ReviewList;
