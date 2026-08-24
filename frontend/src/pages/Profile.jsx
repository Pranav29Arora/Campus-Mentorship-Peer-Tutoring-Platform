import React, { useContext, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { AuthContext } from '../context/AuthContext';
import { User, CheckCircle2, Award, BookOpen, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Account Settings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans flex items-center gap-3">
            Edit Profile Details
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep your academic year, department, and contact information up-to-date.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {success && (
          <div className="p-4 mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center gap-2 shadow-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Profile updated successfully.
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar & Email */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl border-2 border-brand-100 object-cover shadow-sm"
              />
              <div>
                <h4 className="text-lg font-bold text-slate-900 leading-tight">{name}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-500 font-semibold capitalize">Role: {user?.role} Portal</span>
                  {user?.rollNumber && (
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200 font-bold">
                      Roll No: {user.rollNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{email} (Email cannot be changed)</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">University Roll Number</label>
                <input
                  type="text"
                  disabled
                  value={user?.rollNumber || 'N/A'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-mono font-bold cursor-not-allowed uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 text-sm font-semibold text-slate-800 cursor-pointer"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 text-sm font-semibold text-slate-800 cursor-pointer"
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
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-600" />
                  Mentor Profile Info
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Short Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your competencies..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subjects Tutored</label>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-36 overflow-y-auto">
                    {SUBJECTS.map(sub => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => handleSubjectToggle(sub)}
                          className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer font-semibold ${
                            isSelected
                              ? 'bg-brand-50 border-brand-300 text-brand-700 shadow-xs'
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
              className="w-full py-3 font-bold shadow-md shadow-brand-500/25"
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
