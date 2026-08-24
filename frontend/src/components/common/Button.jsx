import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5",
    secondary: "bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/80 hover:border-slate-300 shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 hover:-translate-y-0.5",
    outline: "border border-slate-300 hover:border-brand-500 hover:bg-brand-50/60 text-slate-700 hover:text-brand-600 shadow-sm",
    glass: "glass-panel text-slate-800 hover:bg-white hover:border-brand-400/50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    ghost: "text-slate-600 hover:text-brand-600 hover:bg-slate-100"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5 font-bold"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
};

export default Button;
