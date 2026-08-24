import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({
  title = 'No Results Found',
  message = 'We could not find what you were looking for. Please try adjusting your filters or search terms.',
  icon: Icon = Search,
  actionButton
}) => {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm max-w-md mx-auto my-8">
      <div className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
