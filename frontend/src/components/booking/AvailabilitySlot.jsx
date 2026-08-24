import React from 'react';
import { Clock, BookOpen, Check } from 'lucide-react';

const AvailabilitySlot = ({ slot, onSelect, isSelected }) => {
  const isBooked = slot.status === 'booked';

  if (isBooked) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100/70 opacity-60 cursor-not-allowed">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <div className="text-left">
            <p className="text-xs font-bold text-slate-500">{slot.startTime} - {slot.endTime}</p>
            <p className="text-[11px] text-slate-400 truncate">{slot.subject}</p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-600 font-bold uppercase">
          Booked
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(slot)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
        isSelected
          ? 'bg-brand-50 border-brand-500 shadow-sm ring-2 ring-brand-500/20'
          : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
        <div>
          <p className={`text-xs font-bold ${isSelected ? 'text-brand-900' : 'text-slate-800'}`}>
            {slot.startTime} - {slot.endTime}
          </p>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <BookOpen className="w-3 h-3 text-brand-600" />
            {slot.subject}
          </p>
        </div>
      </div>
      {isSelected ? (
        <span className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center shadow-xs">
          <Check className="w-3 h-3 text-white" />
        </span>
      ) : (
        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-brand-700 font-bold group-hover:bg-brand-100 transition-colors">
          Select
        </span>
      )}
    </button>
  );
};

export default AvailabilitySlot;
