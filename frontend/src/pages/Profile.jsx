import React, { useContext, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { AuthContext } from '../context/AuthContext';
import { User, CheckCircle2, Award, BookOpen } from 'lucide-react';
import { DEPARTMENTS, SUBJECTS } from '../components/mentors/MentorFilters';

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [year, setYear] = useState(user?.year?.toString() || '1');
  const [bio, setBio] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useState(() => {
    // If user is mentor, load bio and subjects from storage profile
    if (user && user.role === 'mentor' && user.mentorId) {
      const mentors = JSON.parse(localStorage.getItem('cc_mentors') || '[]');
      const mProfile = mentors.find(m => m.id === user.mentorId);
      if (mProfile) {
        setBio(mProfile.bio || '');
        setSelectedSubjects(mProfile.subjects || []);
      }
    }
  }, [user]);

  const handleSubjectToggle = (sub) => {
    setSelectedSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    if (!name) {
      setError('Name field cannot be left blank.');
      return;
    }

    try {
      // 1. Update Core User profile
      updateUserProfile({
        name,
        department,
        year: parseInt(year)
      });

      // 2. If mentor, sync mentor profile in localStorage
      if (user.role === 'mentor' && user.mentorId) {
        const mentors = JSON.parse(localStorage.getItem('cc_mentors') || '[]');
        const idx = mentors.findIndex(m => m.id === user.mentorId);
        if (idx !== -1) {
          mentors[idx] = {
            ...mentors[idx],
            name,
            department,
            year: parseInt(year),
            bio,
            subjects: selectedSubjects
          };
          localStorage.setItem('cc_mentors', JSON.stringify(mentors));
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to update profile details.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white font-sans flex items-center gap-2">
            <User className="w-8 h-8 text-brand-500" />
            Edit Profile Details
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Keep your academic year, department, and contact information up-to-date.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {success && (
          <div className="glass-panel p-4 mb-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-sm flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            Profile updated successfully.
          </div>
        )}

        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar & Email */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-850">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-full border border-slate-700 object-cover"
              />
              <div>
                <h4 className="text-base font-bold text-white leading-tight">{name}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-400 font-medium capitalize">Role: {user?.role} Portal</span>
                  {user?.rollNumber && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                      Roll No: {user.rollNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{email} (Email cannot be changed)</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">University Roll Number</label>
                <input
                  type="text"
                  disabled
                  value={user?.rollNumber || 'N/A'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 text-sm font-mono cursor-not-allowed uppercase"
                />
              </div>
            </div>

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
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Mentor Fields */}
            {user?.role === 'mentor' && (
              <div className="space-y-4 pt-4 border-t border-slate-850">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Mentor Profile Info
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Short Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your competencies..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 focus:outline-none focus:border-brand-500 text-sm text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subjects Tutored</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/40 border border-slate-850 rounded-xl max-h-36 overflow-y-auto">
                    {SUBJECTS.map(sub => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => handleSubjectToggle(sub)}
                          className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                              : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
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
              className="w-full py-3"
            >
              Save Profile Changes
            </Button>

          </form>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Profile;
