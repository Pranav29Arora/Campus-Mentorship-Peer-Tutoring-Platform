import React from 'react';
import { BookOpen, Github, Globe, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/90 backdrop-blur-md pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-white" />
              </span>
              <span className="font-extrabold text-lg text-slate-800">CampusConnect</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Empowering students through peer-to-peer knowledge sharing, real-time live tutoring sessions, and senior career mentorship.
            </p>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/mentors" className="hover:text-brand-600 transition-colors font-medium">Find a Mentor</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-600 transition-colors font-medium">Become a Mentor</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 transition-colors font-medium">Demo Portals</Link>
              </li>
            </ul>
          </div>

          {/* Links: Academic */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Subjects</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/mentors?subject=React" className="hover:text-brand-600 transition-colors font-medium">Web Development</Link>
              </li>
              <li>
                <Link to="/mentors?subject=Python" className="hover:text-brand-600 transition-colors font-medium">Data Science & ML</Link>
              </li>
              <li>
                <Link to="/mentors?subject=Data Structures" className="hover:text-brand-600 transition-colors font-medium">Data Structures</Link>
              </li>
            </ul>
          </div>

          {/* Links: Support */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="#how-it-works" className="hover:text-brand-600 transition-colors font-medium">How It Works</a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-brand-600 transition-colors font-medium">Why Learn From Seniors</a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-brand-600 transition-colors font-medium">
                  <Github className="w-4 h-4" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-slate-200 my-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusConnect. Built with modern React, Express & WebRTC.</p>
          <p className="flex items-center gap-1 font-medium">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for interactive peer learning.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
