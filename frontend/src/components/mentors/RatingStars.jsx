import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ rating = 5, size = 16, className = '' }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Render full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={`full-${i}`} 
        size={size} 
        className="text-amber-400 fill-amber-400" 
      />
    );
  }

  // Render half star if necessary
  if (hasHalfStar) {
    stars.push(
      <StarHalf 
        key="half" 
        size={size} 
        className="text-amber-400 fill-amber-400" 
      />
    );
  }

  // Fill up the rest with empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star 
        key={`empty-${i}`} 
        size={size} 
        className="text-slate-300" 
      />
    );
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars}
    </div>
  );
};

export default RatingStars;
