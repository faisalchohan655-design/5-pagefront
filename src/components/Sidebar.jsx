import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Send,
  Users,
  Mail,
  Brain,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Award,
  Bell,
  User,
  PieChart,
  Target,
  Zap,
  Globe,
  MessageCircle,
  BarChart3,
  FolderKanban,
  FileText,
  Clock,
  Star,
  Shield,
  CreditCard,
  LifeBuoy,
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Main Navigation Items
  const mainNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/lead-finder', icon: Search, label: 'Lead Finder' },
    { path: '/campaign-outreach', icon: Send, label: 'Campaigns' },
    { path: '/lead-manager', icon: Users, label: 'Lead Manager' },
    { path: '/email-extractor', icon: Mail, label: 'Email Extractor' },
  ];

  // Secondary Navigation Items
  const secondaryNavItems = [
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/pipeline', icon: FolderKanban, label: 'Pipeline' },
    { path: '/templates', icon: FileText, label: 'Templates' },
  ];

  // Bottom Navigation Items
  const bottomNavItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/help', icon: HelpCircle, label: 'Help & Support' },
  ];

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Toggle mobile
  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  // Render Nav Item
  const renderNavItem = (item, index) => {
    const active = isActive(item.path);
    return (
      <Link
        key={index}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
          ${active 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
            : 'text-gray-400 hover:text-white hover:bg-slate-800'
          }
          ${collapsed ? 'justify-center' : 'justify-start'}
          relative group
        `}
      >
        <item.icon size={20} className="flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
        )}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {item.label}
          </div>
        )}
        {active && !collapsed && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse"></div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg border border-purple-500/20 text-white hover:bg-slate-700 transition-colors"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-purple-500/20 
          transition-all duration-300 z-40 flex flex-col
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`
          flex items-center gap-3 p-4 border-b border-purple-500/20
          ${collapsed ? 'justify-center' : 'justify-between'}
        `}>
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="relative">
              <Brain className="text-purple-400 group-hover:text-purple-300 transition-colors" size={28} />
              <div className="absolute -inset-1 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            {!collapsed && (
              <div className="flex items-center">
                <span className="text-white font-bold text-lg">LeadAI</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 px-1.5 py-0.5 rounded text-[8px] text-white font-bold uppercase tracking-wider ml-1">
                  Pro
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`
              p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-gray-400 hover:text-white
              ${collapsed ? 'hidden' : 'block'}
            `}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {/* Main Navigation */}
          <div className="mb-6">
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                Main Menu
              </p>
            )}
            <div className="space-y-1">
              {mainNavItems.map((item, index) => renderNavItem(item, index))}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="mb-6">
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                Workspace
              </p>
            )}
            <div className="space-y-1">
              {secondaryNavItems.map((item, index) => renderNavItem(item, index))}
            </div>
          </div>

          {/* Quick Stats */}
          {!collapsed && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/20 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-white text-sm font-medium">Quick Stats</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Today's Leads</span>
                  <span className="text-white font-semibold">24</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Hot Leads</span>
                  <span className="text-purple-400 font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Conversion</span>
                  <span className="text-green-400 font-semibold">42%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-purple-500/20 px-3 py-4">
          <div className="space-y-1">
            {bottomNavItems.map((item, index) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                    ${active 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                      : 'text-gray-400 hover:text-white hover:bg-slate-800'
                    }
                    ${collapsed ? 'justify-center' : 'justify-start'}
                    relative group
                  `}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          {!collapsed && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/25">
                  JD
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">John Doe</p>
                  <p className="text-gray-400 text-xs">Pro Plan</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
