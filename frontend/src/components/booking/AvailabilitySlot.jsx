import React from 'react';
import { Clock, BookOpen, Check } from 'lucide-react';

const AvailabilitySlot = ({ slot, onSelect, isSelected }) => {
  const isBooked = slot.status === 'booked';

  if (isBooked) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-900 bg-slate-950/40 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-600" />
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-500">{slot.startTime} - {slot.endTime}</p>
            <p className="text-[10px] text-slate-600 truncate">{slot.subject}</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-500 font-medium">
          Booked
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(slot)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 text-left ${
        isSelected
          ? 'bg-brand-500/10 border-brand-500 shadow-md shadow-brand-500/5'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
        <div>
          <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
            {slot.startTime} - {slot.endTime}
          </p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <BookOpen className="w-2.5 h-2.5 text-brand-500" />
            {slot.subject}
          </p>
        </div>
      </div>
      {isSelected ? (
        <span className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      ) : (
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-brand-400 font-medium group-hover:bg-brand-500/20">
          Book Slot
        </span>
      )}
    </button>
  );
};

export default AvailabilitySlot;
