import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Menu, X, LogOut, User, Calendar, BookOpen, Clock, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      ? "block px-4 py-2 text-brand-500 font-semibold bg-brand-500/10 rounded-xl"
      : "text-brand-500 font-semibold relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-[2px] after:bg-brand-500";
    
    const inactiveClass = isMobile
      ? "block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
      : "text-slate-300 hover:text-white transition-colors duration-200";

    const commonLinks = [
      { label: 'Home', path: '/' },
      { label: 'Find Mentors', path: '/mentors' }
    ];

    let roleLinks = [];
    if (user) {
      if (user.role === 'student') {
        roleLinks = [
          { label: 'Dashboard', path: '/student/dashboard' },
          { label: 'Bookings', path: '/student/bookings' }
        ];
      } else if (user.role === 'mentor') {
        roleLinks = [
          { label: 'Dashboard', path: '/mentor/dashboard' },
          { label: 'Availability', path: '/mentor/availability' },
          { label: 'Bookings', path: '/mentor/bookings' }
        ];
      } else if (user.role === 'admin') {
        roleLinks = [
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Users', path: '/admin/users' }
        ];
      }
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
    <nav className="glass-panel sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={getDashboardLink()} className="flex items-center gap-2">
              <span className="w-9 h-9 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BookOpen className="w-5 h-5 text-white" />
              </span>
              <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
                CampusConnect
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {renderNavLinks(false)}
          </div>

          {/* User Menu / CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl shadow-xl py-2 border border-slate-800">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>

                    <Link
                      to={user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/dashboard`}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      Dashboard
                    </Link>

                    {user.role !== 'admin' && (
                      <Link
                        to={`/${user.role}/profile`}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-indigo-500/10 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-dark-bg/95 backdrop-blur-lg px-4 py-4 space-y-2">
          {renderNavLinks(true)}
          
          <hr className="border-slate-800 my-4" />

          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
                </div>
              </div>
              
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/dashboard`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl"
              >
                Dashboard
              </Link>
              {user.role !== 'admin' && (
                <Link
                  to={`/${user.role}/profile`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl"
                >
                  My Profile
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800/50 rounded-xl text-left"
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
                className="px-4 py-2 text-center rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800/30"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-center rounded-xl text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white font-medium"
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
