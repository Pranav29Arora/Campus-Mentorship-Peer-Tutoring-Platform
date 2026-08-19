import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Button from '../common/Button';

const ReviewForm = ({ mentorName, onSubmit, loading = false }) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      setValidationError('Please select a star rating.');
      return;
    }
    setValidationError('');
    onSubmit(rating, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div className="text-center pb-2">
        <p className="text-sm text-slate-300">How was your session with <strong className="text-white">{mentorName}</strong>?</p>
      </div>

      {/* Interactive Stars Selection */}
      <div className="flex justify-center items-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = hoveredRating ? star <= hoveredRating : star <= rating;
          return (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 rounded-md focus:outline-none transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={32}
                className={`transition-colors duration-200 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Written comment */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Write a review...</label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (e.g. Rahul explained structures well, pacings were good, etc.)..."
          className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-slate-200 placeholder-slate-500"
        />
      </div>

      {validationError && (
        <p className="text-xs text-red-400 text-center font-medium">{validationError}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="w-full"
      >
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
