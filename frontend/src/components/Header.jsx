import { useEffect, useState } from 'react';
import {
  Search,
  Users,
  MessageSquare,
  Bell,
  ChevronDown,
  UserCircle2,
  MapPin,
  Settings2,
  HelpCircle,
  LogOut,
  Heart
} from 'lucide-react';

import logoImg from '../assets/logo-no-bg.jpg';
import FriendsPopover from './FriendsPopover';

export default function Header({ user, onLogout }) {
  const fullName = user?.user_metadata?.full_name || 'User';
  const email = user?.email || '';

  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogout?.();
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

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <img src={logoImg} alt="logo" className="w-30 h-20 object-contain rounded-2xl" />
        <span className="font-serif text-black text-xl font-bold tracking-wider">
          DER LENG
        </span>
      </div>

      {/* CENTER */}
      <div className="flex items-center gap-6 flex-1 justify-center max-w-3xl">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search destinations..."
            className="w-full h-11 pl-5 pr-11 rounded-full bg-emerald-50/30 border border-emerald-600/30 text-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        <button
          onClick={() => setIsFriendsOpen(!isFriendsOpen)}
          className="w-10 h-10 rounded-full border flex items-center justify-center"
        >
          <Users className="w-5 h-5" />
        </button>

        <button className="w-10 h-10 rounded-full border flex items-center justify-center relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-green-400 text-white text-[10px] px-1 rounded-full">
            2
          </span>
        </button>

        <button className="w-10 h-10 rounded-full border flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-green-500" />
        </button>

        {/* PROFILE */}
        <div className="relative" data-profile-menu>
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/20 border"
          >
            <div className="w-8 h-8 rounded-full bg-green-900 text-white flex items-center justify-center text-xs">
              {initials}
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white border rounded-2xl shadow-xl p-2">

              <div className="p-4 bg-emerald-50 rounded-2xl">
                <p className="font-semibold">{fullName}</p>
                <p className="text-sm text-gray-500">{email}</p>
              </div>

              <div className="mt-2 space-y-1">

                <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-emerald-50 rounded-xl">
                  <UserCircle2 size={16} /> My Profile
                </button>

                <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-emerald-50 rounded-xl">
                  <MapPin size={16} /> My Trips
                </button>

                <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-emerald-50 rounded-xl">
                  <Heart size={16} /> Saved Places
                </button>

                <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-emerald-50 rounded-xl">
                  <Settings2 size={16} /> Settings
                </button>

                <button className="flex w-full items-center gap-2 px-3 py-2 hover:bg-emerald-50 rounded-xl">
                  <HelpCircle size={16} /> Help
                </button>
              </div>

              <div className="border-t mt-2 pt-2">
                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>

            </div>
          )}
        </div>

        <FriendsPopover
          isOpen={isFriendsOpen}
          onClose={() => setIsFriendsOpen(false)}
        />
      </div>

    </header>
  );
}