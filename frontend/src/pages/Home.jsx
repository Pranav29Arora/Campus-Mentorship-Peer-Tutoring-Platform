import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import RatingStars from '../components/mentors/RatingStars';
import { mentorService } from '../services/mentorService';
import { ArrowRight, BookOpen, GraduationCap, Video, Users, CheckCircle, Calendar, Star } from 'lucide-react';

const Home = () => {
  const [popularMentors, setPopularMentors] = useState([]);

  useEffect(() => {
    // Load top 3 highest rated mentors
    mentorService.getMentors({ sortBy: 'rating' })
      .then(data => setPopularMentors(data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden px-4">
        {/* Neon blur grids */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            Peer Tutoring Reinvented
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold font-sans text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Learn From Experience. <br />
            <span className="bg-gradient-to-r from-brand-500 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              Grow Together.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Connect with experienced students and mentors for academic guidance, career advice, and personalized peer learning.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Link to="/mentors">
              <Button variant="primary" size="lg" className="w-48" icon={ArrowRight}>
                Find a Mentor
              </Button>
            </Link>
            <Link to="/register?role=mentor">
              <Button variant="outline" size="lg" className="w-48">
                Become a Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-12 bg-slate-950/30 border-y border-slate-900 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="text-3xl font-extrabold text-white">500+</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Mentees Enrolled</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">80+</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Active Mentors</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">1200+</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Tutorial Sessions</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">4.8★</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Average Star Rating</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">How CampusConnect Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Get tutoring support and career prep from your seniors in three simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 relative">
            <span className="absolute top-4 right-6 text-5xl font-extrabold text-slate-800/40">01</span>
            <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white text-left mb-2">Find Your Match</h3>
            <p className="text-sm text-slate-400 text-left leading-relaxed">
              Browse profiles by department, check ratings, review expertise, and filter available subjects.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 relative">
            <span className="absolute top-4 right-6 text-5xl font-extrabold text-slate-800/40">02</span>
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white text-left mb-2">Book a Session</h3>
            <p className="text-sm text-slate-400 text-left leading-relaxed">
              Select an open availability time slot on their calendar and confirm with one click. No overlaps.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 relative">
            <span className="absolute top-4 right-6 text-5xl font-extrabold text-slate-800/40">03</span>
            <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl flex items-center justify-center mb-6">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white text-left mb-2">Join Peer Call</h3>
            <p className="text-sm text-slate-400 text-left leading-relaxed">
              Enter your dashboard, join the built-in video room, and begin sharing screen and talking code.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-16 bg-slate-950/20 border-t border-slate-900/60 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">Why Learn from Seniors?</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Senior students have recently cleared the exact courses, exams, and projects you are struggling with. They offer highly personalized tips, context-rich notes, and real-world placement reviews.
            </p>
            <div className="space-y-3">
              {[
                'Practical course-specific guidance and cheat sheets',
                'One-to-one mockup placement interviews',
                'Peer-level comfort to ask questions without hesitation',
                'Referral networks for internships and clubs'
              ].map(benefit => (
                <div key={benefit} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 shadow-lg text-left relative overflow-hidden bg-gradient-to-tr from-dark-card to-indigo-950/10">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-400">Student Testimonial</span>
            <p className="text-base text-slate-200 italic mt-3 mb-6 leading-relaxed">
              "I was struggling with React states in CS-202. My mentor Priya booked an hour call, drew state components on a screen share, and helped me refactor my project. I went from failing to getting an A!"
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80"
                alt="Student user"
                className="w-10 h-10 rounded-full border border-slate-700 object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-white">Arjun Mehta</h4>
                <p className="text-xs text-slate-500">2nd Year, Computer Science</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Mentors Slider */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">Popular Mern-Stack Mentors</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Highly active senior students answering queries today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularMentors.map(mentor => (
            <div key={mentor.id} className="glass-panel rounded-2xl p-6 flex flex-col justify-between text-left border border-slate-850 hover:border-brand-500/20 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{mentor.name}</h4>
                    <p className="text-xs text-slate-500">{mentor.department} • Year {mentor.year}</p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed italic mb-4">
                  "{mentor.bio}"
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.subjects.slice(0, 3).map(sub => (
                    <span key={sub} className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-850">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span className="text-xs font-bold text-white">{mentor.rating}</span>
                </div>
                <Link to={`/mentor/${mentor.id}`} className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5">
                  Schedule Call
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-950/20 border-t border-slate-900/60 px-4 text-center">
        <div className="max-w-7xl mx-auto space-y-10">
          <h2 className="text-2xl font-bold text-white font-sans">Browse Mentorship Categories</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'JavaScript', 'React', 'Python', 'Machine Learning', 'Data Structures', 'Java', 'C++',
              'Mathematics', 'Computer Networks', 'Database Management', 'Career Guidance', 'Interview Preparation', 'Resume Building'
            ].map(cat => (
              <Link 
                key={cat} 
                to={`/mentors?subject=${encodeURIComponent(cat)}`}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-sm font-semibold rounded-xl text-slate-300 hover:text-white hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-300"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-900/40 to-slate-950 border-t border-slate-900/80 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl font-extrabold text-white font-sans">Ready to Excel This Semester?</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Create your account today. Log in as a student to schedule peer tutoring or apply to become a mentor and share your knowledge!
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="md">
                Register Now
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="md">
                Try Demo Logins
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
