import { useEffect, useState } from 'react';
import { Search, Users, MessageSquare, Bell, ChevronDown, UserCircle2, MapPin, Settings2, HelpCircle, LogOut, Heart } from 'lucide-react';
import logoImg from '../assets/logo-no-bg.jpg';

export default function Header({ page, setPage, setProfileView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', value: 'home' },
    { label: 'Favorites', value: 'favorites' },
    { label: 'About Us', value: 'about' },
  ];

  const handleProfileAction = (view) => {
    setPage('profile');
    setProfileView(view);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-profile-menu]')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="relative z-50 w-full h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      
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
            const isActive = page === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setPage(item.value)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-400'
                    : 'text-emerald-900/80 hover:text-emerald-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
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
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-[#34D399] px-1 text-[10px] font-bold text-white">
            2
          </span>
        </button>

        {/* Alerts Notification Button with Badge */}
        <button className="w-10 h-10 rounded-full border border-emerald-600/20 flex items-center justify-center hover:bg-gray-50 transition-colors relative">
          <Bell className="w-5 h-5 text-emerald-500" />
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-[#34D399] px-1 text-[10px] font-bold text-white">
            2
          </span>
        </button>

        {/* Profile Dropdown Wrapper */}
        <div className="relative z-[60] ml-2" data-profile-menu>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-emerald-50/20 border border-emerald-600/20 cursor-pointer hover:bg-emerald-50/40 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F5132] flex items-center justify-center text-white text-xs font-semibold uppercase tracking-wider">
              SV
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">Sophea</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition ${isMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-[70] mt-3 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-800 text-sm font-semibold text-white">
                    SV
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sophea Vann</p>
                    <p className="text-sm text-gray-500">sophea.v@gmail.com</p>
                    <span className="mt-1 inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Free plan
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <button type="button" onClick={() => handleProfileAction('overview')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-emerald-50">
                  <UserCircle2 size={16} className="text-emerald-700" />
                  <span>My Profile</span>
                </button>
                <button type="button" onClick={() => handleProfileAction('trips')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-emerald-50">
                  <MapPin size={16} className="text-emerald-700" />
                  <span>My Trips</span>
                </button>
                <button type="button" onClick={() => handleProfileAction('saved')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-emerald-50">
                  <Heart size={16} className="text-emerald-700" />
                  <span>Saved Places</span>
                </button>
                <button type="button" onClick={() => handleProfileAction('settings')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-emerald-50">
                  <Settings2 size={16} className="text-emerald-700" />
                  <span>Settings</span>
                </button>
                <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-emerald-50">
                  <HelpCircle size={16} className="text-emerald-700" />
                  <span>Help & Support</span>
                </button>
              </div>

              <div className="mt-2 border-t border-gray-200 pt-2">
                <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50">
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}