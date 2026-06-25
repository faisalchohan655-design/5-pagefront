import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Send, 
  Users, 
  Mail, 
  Brain, 
  Sparkles 
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/lead-finder', icon: Search, label: 'Lead Finder' },
    { path: '/campaign-outreach', icon: Send, label: 'Campaign' },
    { path: '/lead-manager', icon: Users, label: 'Lead Manager' },
    { path: '/email-extractor', icon: Mail, label: 'Email Extractor' },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="relative">
              <Brain className="text-purple-400 group-hover:text-purple-300 transition-colors" size={28} />
              <div className="absolute -inset-1 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-white font-bold text-xl">LeadAI</span>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase tracking-wider">
              Pro
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
              <Sparkles size={20} />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/25">
              JD
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
