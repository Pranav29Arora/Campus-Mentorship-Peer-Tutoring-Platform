import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { BookOpen, User, Award, Shield } from 'lucide-react';

const Login = () => {
  const { login, error, clearError } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      // Route based on role
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate(`/${loggedUser.role}/dashboard`);
      }
    } catch (err) {
      console.error('Login failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleType) => {
    clearError();
    if (roleType === 'student') {
      setEmail('student@campusconnect.com');
      setPassword('student123');
    } else if (roleType === 'mentor') {
      setEmail('mentor@campusconnect.com');
      setPassword('mentor123');
    } else if (roleType === 'admin') {
      setEmail('admin@campusconnect.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-slate-800 shadow-2xl relative z-10 space-y-6">
          
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </span>
            <h2 className="text-2xl font-extrabold text-white font-sans">Welcome Back</h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to your CampusConnect portal</p>
          </div>

          {error && <ErrorMessage message={error} onRetry={clearError} />}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusconnect.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Register redirect */}
          <p className="text-xs text-slate-400 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Register here
            </Link>
          </p>

          <hr className="border-slate-800/80 my-2" />

          {/* Demo Accounts Panel */}
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold text-center">
              Quick Sign-In Demo Profiles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-brand-500/10 hover:border-brand-500/30 bg-brand-500/5 hover:bg-brand-500/10 text-[10px] font-bold text-brand-400 transition-all"
              >
                <User className="w-4 h-4 mb-1" />
                Student
              </button>
              
              <button
                type="button"
                onClick={() => handleQuickFill('mentor')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-500/10 hover:border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-[10px] font-bold text-amber-400 transition-all"
              >
                <Award className="w-4 h-4 mb-1" />
                Mentor
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-rose-500/10 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-[10px] font-bold text-rose-400 transition-all"
              >
                <Shield className="w-4 h-4 mb-1" />
                Admin
              </button>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
