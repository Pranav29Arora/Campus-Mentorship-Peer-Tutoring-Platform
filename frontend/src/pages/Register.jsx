import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { BookOpen, User, Award, CheckCircle, Sparkles, UserPlus } from 'lucide-react';
import { DEPARTMENTS, SUBJECTS } from '../components/mentors/MentorFilters';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
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
    if (!name.trim() || !email.trim() || !password || !confirmPassword || !role) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (!rollNumber.trim()) {
      setValidationError('University Roll Number is mandatory to register.');
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
        name: name.trim(),
        email: email.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-brand-100/40 via-indigo-100/30 to-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl relative z-10 space-y-6">
          
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-2xl shadow-md shadow-brand-500/25 mb-4 text-white">
              <UserPlus className="w-6 h-6" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">Create Your Account</h2>
            <p className="text-sm text-slate-500 mt-1">Join the CampusConnect peer mentorship network</p>
          </div>

          {validationError && <ErrorMessage message={validationError} />}

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
            
            {/* Name & Roll Number Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  University Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 21BCSE101"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 placeholder-slate-400 uppercase tracking-wider transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Role Select Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Choose Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-bold transition-all text-sm cursor-pointer ${
                    role === 'student'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <User className="w-4 h-4 text-brand-600" />
                  Student (Mentee)
                </button>
                
                <button
                  type="button"
                  onClick={() => setRole('mentor')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-bold transition-all text-sm cursor-pointer ${
                    role === 'mentor'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  Senior Mentor
                </button>
              </div>
            </div>

            {/* Department & Year Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 text-sm text-slate-800 cursor-pointer transition-all"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 text-sm text-slate-800 cursor-pointer transition-all"
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
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Short Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="E.g. Computer networks geek who loves teaching Java classes and viva prep..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 text-sm text-slate-800 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Tutoring Subjects</label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {SUBJECTS.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => handleSubjectToggle(sub)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
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
              className="w-full py-3 font-bold mt-4 shadow-md shadow-brand-500/25"
            >
              Create Account
            </Button>

          </form>

          <p className="text-xs text-slate-500 text-center font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
              Log in here
            </Link>
          </p>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
