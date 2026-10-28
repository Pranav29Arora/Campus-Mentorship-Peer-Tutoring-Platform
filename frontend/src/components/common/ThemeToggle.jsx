import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 ${
        isDark
          ? 'bg-slate-800/90 border border-slate-700/80 text-amber-400 hover:bg-slate-700 hover:border-slate-600 shadow-inner'
          : 'bg-slate-100/90 border border-slate-200/90 text-indigo-600 hover:bg-slate-200 hover:border-slate-300 shadow-xs'
      } focus:outline-none focus:ring-2 focus:ring-brand-500/30 group ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          className={`w-5 h-5 transition-all duration-500 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100 group-hover:rotate-45'
          }`}
        />
        <Moon
          className={`w-5 h-5 transition-all duration-500 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100 group-hover:-rotate-12' : '-rotate-90 scale-0 opacity-0 absolute'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide transition-colors">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
