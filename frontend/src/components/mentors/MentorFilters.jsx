import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Bio-Technology'
];

const SUBJECTS = [
  'JavaScript',
  'React',
  'Python',
  'Machine Learning',
  'Data Structures',
  'Java',
  'C++',
  'Mathematics',
  'Computer Networks',
  'Database Management',
  'Career Guidance',
  'Interview Preparation',
  'Resume Building'
];

const MentorFilters = ({ filters, onChange, onClear }) => {
  const handleTextChange = (e) => {
    onChange('search', e.target.value);
  };

  const handleSelectChange = (field, e) => {
    onChange(field, e.target.value);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
        <h3 className="font-sans font-bold text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-500" />
          Filter Mentors
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Filters
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search</label>
        <div className="relative">
          <input
            type="text"
            value={filters.search || ''}
            onChange={handleTextChange}
            placeholder="Search by name, skills, bio..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-slate-200 placeholder-slate-500"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* Department Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
        <select
          value={filters.department || ''}
          onChange={(e) => handleSelectChange('department', e)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject / Topic</label>
        <select
          value={filters.subject || ''}
          onChange={(e) => handleSelectChange('subject', e)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* Min Rating Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Minimum Rating</label>
        <select
          value={filters.minRating || ''}
          onChange={(e) => handleSelectChange('minRating', e)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
        >
          <option value="">Any Rating</option>
          <option value="4.0">★ 4.0 & above</option>
          <option value="4.5">★ 4.5 & above</option>
          <option value="4.8">★ 4.8 & above</option>
        </select>
      </div>

      {/* Sort Settings */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sort By</label>
        <select
          value={filters.sortBy || ''}
          onChange={(e) => handleSelectChange('sortBy', e)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
        >
          <option value="">Default Relevance</option>
          <option value="rating">Highest Rating</option>
          <option value="sessions">Most Experience (Sessions)</option>
        </select>
      </div>

    </div>
  );
};

export default MentorFilters;
export { SUBJECTS, DEPARTMENTS };
