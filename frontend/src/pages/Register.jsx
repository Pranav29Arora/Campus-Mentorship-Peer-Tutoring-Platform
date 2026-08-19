import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { BookOpen, User, Award, CheckCircle } from 'lucide-react';
import { DEPARTMENTS, SUBJECTS } from '../components/mentors/MentorFilters';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('1');
  const [bio, setBio] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const navigate = useNavigate();

  const handleSubjectToggle = (sub) => {
    setSelectedSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Input Validation
    if (!name || !email || !password || !confirmPassword || !role) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        department,
        year: parseInt(year),
        bio: role === 'mentor' ? bio : undefined,
        subjects: role === 'mentor' ? selectedSubjects : undefined,
        expertise: role === 'mentor' ? ['Tutoring', 'Academic Mentoring'] : undefined
      };

      const user = await register(payload);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setValidationError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full glass-panel rounded-2xl p-8 border border-slate-800 shadow-2xl relative z-10 space-y-6">
          
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </span>
            <h2 className="text-2xl font-extrabold text-white font-sans">Create Account</h2>
            <p className="text-sm text-slate-400 mt-1">Join the CampusConnect peer network</p>
          </div>

          {validationError && <ErrorMessage message={validationError} />}

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
            
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
                />
              </div>
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
                />
              </div>
            </div>

            {/* Role Select Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Choose Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all text-sm ${
                    role === 'student'
                      ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Student (Mentee)
                </button>
                
                <button
                  type="button"
                  onClick={() => setRole('mentor')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all text-sm ${
                    role === 'mentor'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Senior Mentor
                </button>
              </div>
            </div>

            {/* Department & Year Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-300"
                >
                  <option value="1">1st Year (Freshman)</option>
                  <option value="2">2nd Year (Sophomore)</option>
                  <option value="3">3rd Year (Junior)</option>
                  <option value="4">4th Year (Senior)</option>
                </select>
              </div>
            </div>

            {/* Mentor Additional Info fields */}
            {role === 'mentor' && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-4 duration-300">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Short Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="E.g. Computer networks geek who loves teaching Java classes..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Tutoring Subjects</label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/80">
                    {SUBJECTS.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => handleSubjectToggle(sub)}
                          className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 mt-4"
            >
              Register
            </Button>

          </form>

          <p className="text-xs text-slate-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Log In
            </Link>
          </p>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
