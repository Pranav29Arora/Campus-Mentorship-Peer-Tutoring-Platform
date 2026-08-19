import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading details...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-6 px-4">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      <p className="text-sm font-medium text-slate-400 font-sans animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg bg-opacity-70 backdrop-blur-xs">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loader;
