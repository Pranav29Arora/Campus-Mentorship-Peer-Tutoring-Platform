import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { BookOpen, User, Award, Shield, Sparkles, CheckCircle2, Lock, Mail } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-brand-100/40 via-indigo-100/30 to-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
          
          {/* Left Visual / Promo Column (Hidden on small mobile) */}
          <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-brand-600 via-indigo-600 to-indigo-800 p-8 text-white flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />
            
            <div className="space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Viva & Tutoring
              </span>
              <h3 className="text-2xl font-extrabold font-sans leading-tight">
                Unlock 1-on-1 Senior Guidance
              </h3>
              <p className="text-indigo-100 text-xs leading-relaxed">
                Connect directly with senior students who mastered your subjects and aced the campus placements.
              </p>
            </div>

            {/* Testimonial preview badge */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <span>★★★★★</span>
                <span className="text-white text-[11px]">4.9 Rated Platform</span>
              </div>
              <p className="text-xs text-indigo-100 italic">
                "Instant slot booking and clean video rooms made viva prep super easy!"
              </p>
            </div>

            <p className="text-[11px] text-indigo-200/80 font-medium relative z-10">
              © CampusConnect • Peer Tutoring
            </p>
          </div>

          {/* Right Form Column */}
          <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 font-sans">Welcome Back</h2>
              </div>
              <p className="text-sm text-slate-500">Sign in to your CampusConnect account to continue</p>
            </div>

            {error && <ErrorMessage message={error} onRetry={clearError} />}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campusconnect.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full py-3 font-bold mt-2 shadow-md shadow-brand-500/25"
              >
                Sign In
              </Button>
            </form>

            {/* Register redirect */}
            <p className="text-xs text-slate-500 text-center font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
                Register free
              </Link>
            </p>

            <hr className="border-slate-100 my-1" />

            {/* Demo Accounts Panel */}
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold text-center">
                One-Click Quick Fill Demo Profiles
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('student')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-brand-200 bg-brand-50/70 hover:bg-brand-100/70 text-xs font-bold text-brand-700 transition-all cursor-pointer shadow-xs hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4 mb-1 text-brand-600" />
                  Student
                </button>
                
                <button
                  type="button"
                  onClick={() => handleQuickFill('mentor')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-xs font-bold text-amber-800 transition-all cursor-pointer shadow-xs hover:-translate-y-0.5"
                >
                  <Award className="w-4 h-4 mb-1 text-amber-600" />
                  Mentor
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-xs font-bold text-purple-800 transition-all cursor-pointer shadow-xs hover:-translate-y-0.5"
                >
                  <Shield className="w-4 h-4 mb-1 text-purple-600" />
                  Admin
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
