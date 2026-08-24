import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Menu, X, LogOut, User, Calendar, BookOpen, Clock, Shield, Sparkles, Bell } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, readNotification } = useContext(AppContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const handleNotifClick = (n) => {
    if (!n.read) {
      readNotification(n.id);
    }
  };

  const handleMarkAllRead = () => {
    if (notifications) {
      notifications.forEach(n => {
        if (!n.read) {
          readNotification(n.id);
        }
      });
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  const renderNavLinks = (isMobile = false) => {
    const activeClass = isMobile
      ? "block px-4 py-2.5 text-brand-600 font-bold bg-brand-50 rounded-xl"
      : "text-brand-600 font-bold relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-[2.5px] after:bg-brand-600 after:rounded-full";
    
    const inactiveClass = isMobile
      ? "block px-4 py-2.5 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-all font-medium"
      : "text-slate-600 hover:text-brand-600 transition-colors duration-200 font-medium";

    const commonLinks = [
      { label: 'Home', path: '/' }
    ];

    let roleLinks = [];
    if (user) {
      if (user.role === 'student') {
        roleLinks = [
          { label: 'Find Mentors', path: '/mentors' },
          { label: 'Dashboard', path: '/student/dashboard' },
          { label: 'My Bookings', path: '/student/bookings' }
        ];
      } else if (user.role === 'mentor') {
        roleLinks = [
          { label: 'Dashboard', path: '/mentor/dashboard' },
          { label: 'Availability', path: '/mentor/availability' },
          { label: 'Sessions', path: '/mentor/bookings' }
        ];
      } else if (user.role === 'admin') {
        roleLinks = [
          { label: 'Admin Hub', path: '/admin/dashboard' },
          { label: 'User Directory', path: '/admin/users' }
        ];
      }
    } else {
      roleLinks = [
        { label: 'Find Mentors', path: '/mentors' }
      ];
    }

    const allLinks = [...commonLinks, ...roleLinks];

    return (
      <>
        {allLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setMobileMenuOpen(false)}
            className={isActiveLink(link.path) ? activeClass : inactiveClass}
          >
            {link.label}
          </Link>
        ))}
      </>
    );
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 shadow-sm border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={getDashboardLink()} className="flex items-center gap-2.5 group">
              <span className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-5 h-5 text-white" />
              </span>
              <div className="flex flex-col">
                <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-600 bg-clip-text text-transparent">
                  CampusConnect
                </span>
                <span className="text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                  Peer Mentorship
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            {renderNavLinks(false)}
          </div>

          {/* User Menu / CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl relative transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-3 border border-slate-200 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                        <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-brand-600 hover:text-brand-700 font-bold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {(!notifications || notifications.length === 0) ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400 italic">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className={`px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                                !n.read ? 'bg-brand-50/20' : ''
                              }`}
                            >
                              <p className="text-xs font-bold text-slate-800 flex justify-between items-start gap-2">
                                <span>{n.title}</span>
                                {!n.read && (
                                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0 mt-1" />
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[8px] text-slate-400 font-medium block mt-1">
                                {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100/80 border border-slate-200/80 transition-all shadow-xs"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-brand-200 object-cover ring-2 ring-brand-500/20"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded capitalize">
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                      </div>

                      <Link
                        to={user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/dashboard`}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50/50 transition-colors"
                      >
                        {user.role === 'admin' ? <Shield className="w-4 h-4 text-brand-600" /> : <Clock className="w-4 h-4 text-brand-600" />}
                        Dashboard
                      </Link>

                      {user.role !== 'admin' && (
                        <Link
                          to={`/${user.role}/profile`}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50/50 transition-colors"
                        >
                          <User className="w-4 h-4 text-brand-600" />
                          My Profile
                        </Link>
                      )}

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-100/70 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-sm shadow-brand-500/25 hover:shadow-md hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl relative transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl py-3 border border-slate-200 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-brand-600 hover:text-brand-700 font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {(!notifications || notifications.length === 0) ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400 italic">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={`px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                              !n.read ? 'bg-brand-50/20' : ''
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-800 flex justify-between items-start gap-2">
                              <span>{n.title}</span>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[8px] text-slate-400 font-medium block mt-1">
                              {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setNotifDropdownOpen(false);
              }}
              className="text-slate-600 hover:text-slate-900 p-2 focus:outline-none rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 py-4 space-y-2 shadow-lg">
          {renderNavLinks(true)}
          
          <hr className="border-slate-200 my-4" />

          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-slate-300 object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-brand-600 font-semibold truncate capitalize">{user.role}</p>
                </div>
              </div>
              
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/dashboard`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl"
              >
                Dashboard
              </Link>
              {user.role !== 'admin' && (
                <Link
                  to={`/${user.role}/profile`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl"
                >
                  My Profile
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-center rounded-xl text-sm font-bold text-slate-700 hover:text-brand-600 border border-slate-200 hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-center rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
