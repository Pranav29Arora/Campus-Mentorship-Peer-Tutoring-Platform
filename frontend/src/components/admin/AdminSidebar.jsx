import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Calendar, BarChart3 } from 'lucide-react';

const AdminSidebar = ({ activeTab }) => {
  const baseItemClass = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300";
  
  const activeClass = `${baseItemClass} bg-brand-500/10 text-brand-400 border border-brand-500/25`;
  const inactiveClass = `${baseItemClass} text-slate-400 hover:text-white hover:bg-slate-800/40`;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-sm h-full flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
        <Shield className="w-5 h-5 text-rose-500" />
        <h3 className="font-sans font-bold text-white text-base">Admin Panel</h3>
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
