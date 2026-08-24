import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trend, color = 'brand' }) => {
  const borderColors = {
    brand: 'border-slate-200 hover:border-brand-300',
    emerald: 'border-slate-200 hover:border-emerald-300',
    amber: 'border-slate-200 hover:border-amber-300',
    rose: 'border-slate-200 hover:border-rose-300'
  };

  const iconColors = {
    brand: 'bg-brand-50 text-brand-600 border-brand-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200'
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${borderColors[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5 font-sans leading-none">{value}</h3>
        </div>
        {Icon && (
          <span className={`w-11 h-11 border rounded-2xl flex items-center justify-center shadow-xs ${iconColors[color]}`}>
            <Icon className="w-5 h-5" />
          </span>
        )}
      </div>
      {(description || trend) && (
        <div className="flex items-center gap-2 mt-4 text-xs">
          {trend && <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">{trend}</span>}
          {description && <span className="text-slate-500 font-medium">{description}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
