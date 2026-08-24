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
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <h3 className="font-sans font-bold text-slate-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          Filter Mentors
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Search</label>
        <div className="relative">
          <input
            type="text"
            value={filters.search || ''}
            onChange={handleTextChange}
            placeholder="Search by name, skills, bio..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Department Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department</label>
        <select
          value={filters.department || ''}
          onChange={(e) => handleSelectChange('department', e)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 text-sm text-slate-800 transition-all cursor-pointer"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subject / Topic</label>
        <select
          value={filters.subject || ''}
          onChange={(e) => handleSelectChange('subject', e)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 text-sm text-slate-800 transition-all cursor-pointer"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* Min Rating Dropdown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Minimum Rating</label>
        <select
          value={filters.minRating || ''}
          onChange={(e) => handleSelectChange('minRating', e)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 text-sm text-slate-800 transition-all cursor-pointer"
        >
          <option value="">Any Rating</option>
          <option value="4.0">★ 4.0 & above</option>
          <option value="4.5">★ 4.5 & above</option>
          <option value="4.8">★ 4.8 & above</option>
        </select>
      </div>

      {/* Sort Settings */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sort By</label>
        <select
          value={filters.sortBy || ''}
          onChange={(e) => handleSelectChange('sortBy', e)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 text-sm text-slate-800 transition-all cursor-pointer"
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
