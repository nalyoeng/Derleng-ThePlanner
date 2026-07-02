import React, { useState } from 'react';
import { Search, Users, MessageSquare, Bell, ChevronDown } from 'lucide-react';
import logoImg from '../assets/logo-no-bg.jpg';

export default function Header() {
  const [activeTab, setActiveTab] = useState('Home');

  const navItems = ['Home', 'Favorites', 'About Us'];

  return (
    <header className="w-full h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      
      {/* LEFT: Branding & Logo */}
      <div className="flex items-center gap-3">
        {/* Logo Container with your subtle soft blue/green oval background tint */}
        <div className="w-30 h-full flex items-center justify-center">
          <img 
            src={logoImg}
            alt="Der Leng Logo" 
            className="w-30 h-20 object-contain rounded-2xl"
            onError={(e) => {
              // Fallback placeholder icon if image isn't loaded yet
              e.target.style.display = 'none';
            }}
          />
        </div>
        
        {/* Brand Text - Styled matching the gold tone */}
        <span className="font-serif text-black text-xl font-bold tracking-wider">
          DER LENG
        </span>
      </div>

      {/* MIDDLE: Navigation Tabs & Search Input */}
      <div className="flex items-center gap-6 flex-1 justify-center max-w-3xl">
        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-400'
                    : 'text-emerald-900/80 hover:text-emerald-900 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* Dynamic Search Container */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search destinations, regions..."
            className="w-full h-11 pl-5 pr-11 rounded-full bg-emerald-50/30 border border-emerald-600/30 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-800/70 cursor-pointer hover:text-emerald-800" />
        </div>
      </div>

      {/* RIGHT: System Utilities & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Friends/Groups Icon */}
        <button className="w-10 h-10 rounded-full border border-emerald-600/20 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Users className="w-5 h-5 text-gray-800" />
        </button>

        {/* Chat Button with Notification Badge */}
        <button className="w-10 h-10 rounded-full border border-emerald-600/20 flex items-center justify-center hover:bg-gray-50 transition-colors relative">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#34D399] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border border-white">
            2
          </span>
        </button>

        {/* Alerts Notification Button with Badge */}
        <button className="w-10 h-10 rounded-full border border-emerald-600/20 flex items-center justify-center hover:bg-gray-50 transition-colors relative">
          <Bell className="w-5 h-5 text-emerald-500" />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#34D399] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border border-white">
            2
          </span>
        </button>

        {/* Profile Dropdown Wrapper */}
        <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-emerald-50/20 border border-emerald-600/20 cursor-pointer hover:bg-emerald-50/40 transition-all ml-2">
          {/* Avatar Base */}
          <div className="w-8 h-8 rounded-full bg-[#0F5132] flex items-center justify-center text-white text-xs font-semibold uppercase tracking-wider">
            SV
          </div>
          {/* Profile Name & Menu Trigger */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900">Sophea</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

    </header>
  );
}