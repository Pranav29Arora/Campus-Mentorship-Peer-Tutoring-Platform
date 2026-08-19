import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trend, color = 'brand' }) => {
  const borderColors = {
    brand: 'border-brand-500/20 hover:border-brand-500/40',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40',
    amber: 'border-amber-500/20 hover:border-amber-500/40',
    rose: 'border-rose-500/20 hover:border-rose-500/40'
  };

  const iconColors = {
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className={`glass-panel p-5 rounded-2xl border transition-all duration-300 shadow-sm ${borderColors[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 font-sans leading-none">{value}</h3>
        </div>
        {Icon && (
          <span className={`w-10 h-10 border rounded-xl flex items-center justify-center ${iconColors[color]}`}>
            <Icon className="w-5 h-5" />
          </span>
        )}
      </div>
      {(description || trend) && (
        <div className="flex items-center gap-2 mt-4 text-xs">
          {trend && <span className="text-emerald-400 font-bold">{trend}</span>}
          {description && <span className="text-slate-400">{description}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
