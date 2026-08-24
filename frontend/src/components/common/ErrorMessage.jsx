import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorMessage = ({ message = 'An error occurred. Please try again.', onRetry }) => {
  return (
    <div className="bg-rose-50/80 p-6 rounded-2xl border border-rose-200 text-center shadow-sm my-4">
      <div className="w-12 h-12 bg-rose-100 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">Something Went Wrong</h4>
      <p className="text-sm text-slate-600 max-w-sm mx-auto mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
