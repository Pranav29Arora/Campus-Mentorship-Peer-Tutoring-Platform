import React from 'react';
import { BookOpen, Github, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-dark-bg/60 backdrop-blur-md pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </span>
              <span className="font-extrabold text-lg text-white">CampusConnect</span>
            </div>
            <p className="text-sm text-slate-400">
              CampusConnect bridges junior and senior students for peer tutoring, career planning, and structured academic mentorship.
            </p>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/mentors" className="hover:text-white transition-colors">Find a Mentor</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Become a Mentor</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Demo Portals</Link>
              </li>
            </ul>
          </div>

          {/* Links: Academic */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Subjects</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/mentors?subject=React" className="hover:text-white transition-colors">Web Development</Link>
              </li>
              <li>
                <Link to="/mentors?subject=Python" className="hover:text-white transition-colors">Data Science & ML</Link>
              </li>
              <li>
                <Link to="/mentors?subject=Data Structures" className="hover:text-white transition-colors">Data Structures</Link>
              </li>
            </ul>
          </div>

          {/* Links: Support */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-white transition-colors">Benefits Program</a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                  GitHub Source
                </a>
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-slate-900 my-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusConnect. Built as a BTech BEE/MERN Project.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for peer learning.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
