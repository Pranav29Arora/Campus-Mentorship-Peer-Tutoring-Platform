import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorMessage = ({ message = 'An error occurred. Please try again.', onRetry }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-red-500/20 text-center shadow-lg my-4">
      <div className="w-12 h-12 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-white mb-1">Something Went Wrong</h4>
      <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
