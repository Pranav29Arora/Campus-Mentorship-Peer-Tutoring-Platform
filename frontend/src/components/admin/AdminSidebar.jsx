import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Calendar, BarChart3 } from 'lucide-react';

const AdminSidebar = ({ activeTab }) => {
  const baseItemClass = "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200";
  
  const activeClass = `${baseItemClass} bg-brand-50 text-brand-700 border border-brand-200 shadow-xs`;
  const inactiveClass = `${baseItemClass} text-slate-600 hover:text-brand-600 hover:bg-slate-50`;

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Shield className="w-4.5 h-4.5" />
        </div>
        <h3 className="font-sans font-extrabold text-slate-900 text-base">Admin Panel</h3>
      </div>

      <nav className="flex flex-col gap-2">
        <Link 
          to="/admin/dashboard" 
          className={activeTab === 'stats' ? activeClass : inactiveClass}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          Platform Overview
        </Link>
        
        <Link 
          to="/admin/users" 
          className={activeTab === 'users' ? activeClass : inactiveClass}
        >
          <Users className="w-4.5 h-4.5" />
          Manage Users
        </Link>

        <Link 
          to="/admin/bookings" 
          className={activeTab === 'bookings' ? activeClass : inactiveClass}
        >
          <Calendar className="w-4.5 h-4.5" />
          Track Bookings
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
