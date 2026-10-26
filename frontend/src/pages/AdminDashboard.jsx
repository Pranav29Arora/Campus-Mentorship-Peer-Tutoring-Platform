import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatCard from '../components/dashboard/StatCard';
import UserTable from '../components/admin/UserTable';
import BookingTable from '../components/admin/BookingTable';
import Statistics from '../components/admin/Statistics';
import Loader from '../components/common/Loader';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { Shield, Users, Calendar, Award, Star, ToggleLeft, Sparkles } from 'lucide-react';
import { adminService } from '../services/adminService';

const AdminDashboard = ({ activeTab = 'stats' }) => {
  const { user } = useContext(AuthContext);
  const { bookings } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    summary: {
      totalStudents: 0,
      totalMentors: 0,
      totalBookings: 0,
      completedSessions: 0,
      activeUsers: 0,
      avgRating: 5.0
    },
    charts: {
      sessionsOverTime: [],
      popularSubjects: []
    }
  });

  useEffect(() => {
    loadAdminData();
  }, [bookings]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getStatistics(),
        adminService.getUsers()
      ]);
      if (statsData) setStats(statsData);
      if (usersData) setUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      await loadAdminData();
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };


  const { summary } = stats;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            Superadmin Access
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans flex items-center gap-2.5">
            Administration Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System logs, user management, and aggregate peer mentoring performance charts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AdminSidebar activeTab={activeTab} />
          </div>

          {/* Tab Contents */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <Loader message="Fetching admin records..." />
            ) : (
              <>
                {/* 1. Statistics Tab */}
                {activeTab === 'stats' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <StatCard
                        title="Total Students"
                        value={summary.totalStudents}
                        icon={Users}
                        color="brand"
                      />
                      <StatCard
                        title="Total Mentors"
                        value={summary.totalMentors}
                        icon={Award}
                        color="amber"
                      />
                      <StatCard
                        title="Total Sessions"
                        value={summary.totalBookings}
                        icon={Calendar}
                        color="brand"
                      />
                      <StatCard
                        title="Completed Sessions"
                        value={summary.completedSessions}
                        icon={CheckCircle2}
                        color="emerald"
                      />
                      <StatCard
                        title="Active Accounts"
                        value={summary.activeUsers}
                        icon={ToggleLeft}
                        color="brand"
                      />
                      <StatCard
                        title="Avg Rating"
                        value={`${summary.avgRating}★`}
                        icon={Star}
                        color="amber"
                      />
                    </div>

                    <Statistics stats={stats} />
                  </div>
                )}

                {/* 2. Users Tab */}
                {activeTab === 'users' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-bold text-slate-900 font-sans">Manage User Access</h3>
                    <UserTable users={users} onToggleStatus={handleToggleUserStatus} />
                  </div>
                )}

                {/* 3. Bookings Tab */}
                {activeTab === 'bookings' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-bold text-slate-900 font-sans">Track Scheduled Bookings</h3>
                    <BookingTable bookings={bookings} />
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

// SVG visual helper
const CheckCircle2 = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default AdminDashboard;
