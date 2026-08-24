import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import RatingStars from '../components/mentors/RatingStars';
import { mentorService } from '../services/mentorService';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Video, 
  Users, 
  CheckCircle, 
  Calendar, 
  Star, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const isMentor = user?.role === 'mentor';
  const [popularMentors, setPopularMentors] = useState([]);

  useEffect(() => {
    // Load top 3 highest rated mentors
    mentorService.getMentors({ sortBy: 'rating' })
      .then(data => setPopularMentors(data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Ambient background glow orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-200/40 via-indigo-100/30 to-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-blue-100/50 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Content */}
            {isMentor ? (
              /* Mentor Hero Left */
              <div className="lg:col-span-7 text-center lg:text-left space-y-6 animate-fade-in">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200 shadow-sm text-brand-700 text-xs font-bold tracking-wide">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Lead. Guide. Inspire.</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sans text-slate-900 tracking-tight leading-[1.12]">
                  Empower Peers. <br />
                  <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Share Knowledge.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Welcome to your mentor space. Publish availability slots on your calendar, host WebRTC coding rooms, review junior assignments, and guide peers.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-3">
                  <Link to="/mentor/dashboard" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-48 shadow-lg shadow-brand-500/25" icon={ArrowRight}>
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/mentor/availability" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-48 bg-white hover:bg-slate-50">
                      Manage Time Slots
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators / Quick Stats */}
                <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Build Leadership Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-brand-600" />
                    <span>1-on-1 Built-in Calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Manage Calendar Slots</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Student Hero Left (default) */
              <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200 shadow-sm text-brand-700 text-xs font-bold tracking-wide">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Next-Gen Campus Mentorship & Viva Prep</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-sans text-slate-900 tracking-tight leading-[1.12]">
                  Learn From Experience. <br />
                  <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Grow Together.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Connect 1-on-1 with high-achieving seniors for personalized academic tutoring, viva exam preparation, assignment reviews, and real placement interview tips.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-3">
                  <Link to="/mentors" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-48 shadow-lg shadow-brand-500/25" icon={ArrowRight}>
                      Find a Mentor
                    </Button>
                  </Link>
                  <Link to="/register?role=mentor" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-48 bg-white hover:bg-slate-50">
                      Become a Mentor
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators / Quick Stats */}
                <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>100% Peer-Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-brand-600" />
                    <span>Built-in WebRTC Video Calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Instant Slot Booking</span>
                  </div>
                </div>
              </div>
            )}

            {/* Right Hero Visual with Floating Animated Badges */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* Central Hero Image Card */}
              <div className="relative rounded-3xl p-2.5 bg-white shadow-2xl border border-slate-200/80 max-w-md w-full">
                <div className="overflow-hidden rounded-2xl relative aspect-[4/3] group">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80"
                    alt="Students collaborating and tutoring on campus"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-block px-2.5 py-1 bg-brand-600/90 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider mb-1">
                      Live Peer Network
                    </span>
                    <p className="text-sm font-bold drop-shadow">Computer Science & Engineering Hub</p>
                  </div>
                </div>

                {/* Floating Badge 1: Live Call (Top Left) */}
                <div className="absolute -top-6 -left-6 sm:-left-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 animate-float flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      alt="Active Mentor"
                      className="w-10 h-10 rounded-xl object-cover border border-brand-200"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">Priya Singh</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">Live Call</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-1 bg-brand-500 rounded-full animate-wave-1"></span>
                        <span className="w-1 bg-brand-500 rounded-full animate-wave-2"></span>
                        <span className="w-1 bg-brand-500 rounded-full animate-wave-3"></span>
                        <span className="w-1 bg-brand-500 rounded-full animate-wave-4"></span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium ml-1">React Hooks Viva</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2: Rating & Sessions (Bottom Right) */}
                <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 animate-float-delayed flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200/70">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-extrabold text-slate-900">4.9 / 5.0</span>
                      <span className="text-[10px] font-bold text-amber-600">Top Rated</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold">1,200+ Sessions Done</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-10 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">500+</h3>
            <p className="text-xs text-brand-600 mt-1 uppercase tracking-wider font-bold">Mentees Enrolled</p>
          </div>
          <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">80+</h3>
            <p className="text-xs text-brand-600 mt-1 uppercase tracking-wider font-bold">Verified Mentors</p>
          </div>
          <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">1,200+</h3>
            <p className="text-xs text-brand-600 mt-1 uppercase tracking-wider font-bold">Sessions Completed</p>
          </div>
          <div className="p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">4.8★</h3>
            <p className="text-xs text-brand-600 mt-1 uppercase tracking-wider font-bold">Average Star Rating</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            {isMentor ? 'Peer Guide Process' : 'Simple 3-Step Process'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
            How CampusConnect Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {isMentor 
              ? 'Guide juniors, answer academic queries, and build your campus leadership profile in three steps.' 
              : 'Get targeted tutoring support and semester exam prep from senior students in three simple steps.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isMentor ? (
            <>
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 relative shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 transform hover:-translate-y-1.5 text-left group">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-slate-100 group-hover:text-brand-100/60 transition-colors">01</span>
                <div className="w-14 h-14 bg-brand-50 border border-brand-200 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Publish Time Slots</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Publish availability slots on your calendar. Collision guards ensure slots align with your class schedules perfectly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 relative shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1.5 text-left group">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-slate-100 group-hover:text-indigo-100/60 transition-colors">02</span>
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Join Peer Call</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Host live 1-on-1 tutoring sessions via our built-in video player. Share your screen to review code or study materials together.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 relative shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1.5 text-left group">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-slate-100 group-hover:text-purple-100/60 transition-colors">03</span>
                <div className="w-14 h-14 bg-purple-50 border border-purple-200 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Earn Ratings & Reviews</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Receive verified feedback ratings and positive reviews from juniors, building up your leadership profile on campus.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 relative shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 transform hover:-translate-y-1.5 text-left group">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-slate-100 group-hover:text-brand-100/60 transition-colors">01</span>
                <div className="w-14 h-14 bg-brand-50 border border-brand-200 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Find Your Match</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Browse top mentors by department, check real feedback ratings, review subject specializations, and find who cleared your exact course.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 relative shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1.5 text-left group">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-slate-100 group-hover:text-indigo-100/60 transition-colors">02</span>
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Book a Session</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pick an open availability slot on the mentor\'s live calendar. Automatic collision guards ensure zero schedule overlaps with your classes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 relative shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1.5 text-left group">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-slate-100 group-hover:text-purple-100/60 transition-colors">03</span>
                <div className="w-14 h-14 bg-purple-50 border border-purple-200 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Join Peer Call</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter your dashboard, hop into the built-in WebRTC video room, share your code screen, and solve tricky bugs collaboratively.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-slate-100/70 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {isMentor ? (
            <div className="text-left space-y-6 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Why Become a Peer Mentor?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight leading-tight">
                Reinforce your own skills while helping others grow.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                The best way to master a subject is to teach it. Build leadership experience for your resume, get peer recognition, and build a stronger tech community.
              </p>
              
              <div className="space-y-3.5 pt-2">
                {[
                  'Reinforce core CS, engineering, and coding fundamentals by explaining them',
                  'Build critical communication, presentation, and leadership qualities',
                  'Enhance your resume with verified academic tutoring and mentoring experience',
                  'Expand your campus network and gain recognition across academic clubs'
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-left space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Why Senior Peer Mentoring?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight leading-tight">
                Seniors cleared the exact syllabus you're facing now.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Professors teach concepts, but seniors teach you how to ace the practicals, avoid viva traps, and structure resume projects that get internship shortlisted.
              </p>
              
              <div className="space-y-3.5 pt-2">
                {[
                  'Practical course-specific exam cheat sheets and past viva queries',
                  '1-on-1 mock placement interviews and resume code reviews',
                  'Peer-level comfort to ask foundational questions without hesitation',
                  'Internship referral network across tech clubs and hackathons'
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Testimonial Spotlight Card */}
          <div className="relative">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-left relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                  Verified Student Review
                </span>
                <RatingStars rating={5} size={16} />
              </div>
              
              <p className="text-base sm:text-lg text-slate-700 italic mb-6 leading-relaxed font-normal">
                "I was really struggling with React state and async APIs in CS-202. My mentor Priya scheduled a 45-minute live call, screenshared the component hierarchy, and reviewed my code line-by-line. I got an A on my viva exam!"
              </p>
              
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120"
                  alt="Arjun Mehta"
                  className="w-12 h-12 rounded-full border-2 border-brand-200 object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Arjun Mehta</h4>
                  <p className="text-xs text-slate-500 font-medium">2nd Year • Computer Science & Engg</p>
                </div>
              </div>
            </div>

            {/* Decorative background blur behind card */}
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </section>

      {/* Popular Mentors Grid (Only for students / guests) */}
      {!isMentor && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Top Rated Tutors
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
              Popular MERN-Stack Mentors
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Connect with highly rated senior students ready to guide you this week.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularMentors.map(mentor => (
              <div 
                key={mentor.id} 
                className="bg-white rounded-3xl p-6 flex flex-col justify-between text-left border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 transform hover:-translate-y-1.5 group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-brand-200 group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {mentor.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {mentor.department} • <span className="text-brand-600 font-semibold">Year {mentor.year}</span>
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{mentor.bio}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mentor.subjects.slice(0, 3).map(sub => (
                      <span key={sub} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-800">{mentor.rating}</span>
                    <span className="text-[10px] text-slate-400">({mentor.totalSessions} sessions)</span>
                  </div>
                  <Link 
                    to={`/mentor/${mentor.id}`} 
                    className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Schedule Call
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link to="/mentors">
              <Button variant="outline" size="md" className="bg-white hover:bg-slate-50 shadow-xs" icon={ArrowRight}>
                View All Mentors
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Categories Section (Only for students / guests) */}
      {!isMentor && (
        <section className="py-16 bg-white border-t border-slate-200/80 px-4 text-center">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
                Explore Popular Subjects & Domains
              </h2>
              <p className="text-slate-500 text-sm mt-1">Select a subject to instantly discover available peer mentors.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                'JavaScript', 'React', 'Python', 'Machine Learning', 'Data Structures', 'Java', 'C++',
                'Mathematics', 'Computer Networks', 'Database Management', 'Career Guidance', 'Interview Preparation', 'Resume Building'
              ].map(cat => (
                <Link 
                  key={cat} 
                  to={`/mentors?subject=${encodeURIComponent(cat)}`}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl text-slate-700 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/60 transition-all duration-200 shadow-xs hover:-translate-y-0.5"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-600 via-indigo-600 to-indigo-800 text-white px-4 text-center relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            {isMentor ? 'Mentor Workspace' : 'Start Today'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-sans tracking-tight">
            {isMentor ? 'Ready to Host Your Next Session?' : 'Ready to Ace This Semester?'}
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {isMentor 
              ? 'Navigate to your dashboard to review upcoming bookings, manage your slots, or connect with peers using our HD video tool.' 
              : 'Create your account today. Log in as a student to schedule peer tutoring or apply to become a mentor and build leadership experience.'}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            {isMentor ? (
              <>
                <Link to="/mentor/dashboard">
                  <Button variant="secondary" size="lg" className="w-full sm:w-44 bg-white text-brand-700 hover:bg-slate-50 font-bold shadow-lg">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/mentor/availability">
                  <Button variant="outline" size="lg" className="w-full sm:w-44 border-white/40 text-white hover:bg-white/10 font-bold">
                    Edit Open Slots
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="w-full sm:w-44 bg-white text-brand-700 hover:bg-slate-50 font-bold shadow-lg">
                    Register Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-44 border-white/40 text-white hover:bg-white/10 font-bold">
                    Try Demo Logins
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
