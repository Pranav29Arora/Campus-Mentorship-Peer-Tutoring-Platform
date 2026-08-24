import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-brand-50 border border-brand-200 text-brand-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 font-sans">Page Not Found</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              The page you are looking for does not exist or has been relocated by the site administrator.
            </p>
          </div>

          <Link to="/" className="block">
            <Button variant="primary" className="w-full py-3 font-bold shadow-md shadow-brand-500/25" icon={Home}>
              Go to Home Page
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
