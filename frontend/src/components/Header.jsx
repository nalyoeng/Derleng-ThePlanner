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
  Heart,
  X,
} from 'lucide-react';
import { Link,useLocation } from 'react-router-dom';
import logoImg from '../assets/logo-no-bg.jpg';
import FriendsPopover from './FriendsPopover';

export default function Header({ 
  user, 
  onLogout,
  showSearch = false,
  searchTerm = "",
  onSearchChange,
  destinations = [],}) {
  const fullName = user?.user_metadata?.full_name || 'User';
  const email = user?.email || '';

  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const [showFilters, setShowFilters] =useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home'); // Tracks current page tab styling
  const location = useLocation();


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
  const searchResults = destinations
  .filter((destination) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return false;

    const tags = Array.isArray(destination.tags)
      ? destination.tags.join(" ")
      : destination.tags || "";

    const searchText = [
      destination.name,
      destination.location,
      destination.category,
      destination.description,
      tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(search);
  })
  .slice(0, 6);
  return (
    <header className="relative z-50 w-full h-20 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#EBE8E2] flex items-center justify-between px-8 shadow-sm">

      {/* LEFT: Branding Section */}
      <div className="flex items-center gap-4">
        <div className="p-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
          <img src={logoImg} alt="logo" className="w-14 h-11 object-contain rounded-xl" />
        </div>
        <span className="font-serif text-[#9A814E] text-xl font-bold tracking-widest uppercase">
          DER LENG
        </span>
      </div>

      {/* CENTER: Navigation Links + Main Search Input Bar */}
<div className="flex items-center gap-8 flex-1 justify-center max-w-4xl px-4">
  
  {/* Navigation Tabs Links */}
  <nav className="flex items-center gap-1.5 bg-[#F1EFEA] p-1 rounded-full border border-[#E3DFD5]">
    
    <Link
      to="/"
      className={`px-5 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-200 ${
        location.pathname === '/'
          ? 'bg-[#D2EBE1] text-[#1E4620] shadow-sm font-semibold'
          : 'text-gray-600 hover:text-black hover:bg-black/5'
      }`}
    >
      Home
    </Link>

    <Link
      to="/favorites"
      className={`px-5 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-200 ${
        location.pathname === '/favorites'
          ? 'bg-[#D2EBE1] text-[#1E4620] shadow-sm font-semibold'
          : 'text-gray-600 hover:text-black hover:bg-black/5'
      }`}
    >
      Favorites
    </Link>

    <Link
      to="/about"
      className={`px-5 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-200 ${
        location.pathname === '/about'
          ? 'bg-[#D2EBE1] text-[#1E4620] shadow-sm font-semibold'
          : 'text-gray-600 hover:text-black hover:bg-black/5'
      }`}
    >
      About Us
    </Link>


  </nav>

  {/* Global Search Bar field box */}
  {showSearch && (
  <div className="relative flex-1 max-w-md">
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

      <input
        type="search"
        value={searchTerm}
        onChange={(event) =>
          onSearchChange?.(event.target.value)
        }
        placeholder="Search destinations, regions..."
        className="w-full h-11 pl-11 pr-11 rounded-full bg-[#F3F1EC] border border-[#E1DDD4] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600/40 focus:bg-white transition-all"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={() => onSearchChange?.("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      )}
    </div>

    {/* Search suggestions */}
    {searchTerm.trim() && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E1DDD4] rounded-2xl shadow-xl overflow-hidden z-[100]">
        {searchResults.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No destinations found for “{searchTerm}”
          </div>
        ) : (
          searchResults.map((destination) => {
            const image =
              destination.img ||
              destination.image_url ||
              destination.images?.[0];

            return (
              <Link
                key={destination.id}
                to={`/destination/${destination.id}`}
                onClick={() => onSearchChange?.("")}
                className="flex items-center gap-3 p-3 hover:bg-[#F6F4F0] border-b border-gray-100 last:border-b-0"
              >
                {image ? (
                  <img
                    src={image}
                    alt={destination.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {destination.name}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {destination.location}
                    {destination.category
                      ? ` · ${destination.category}`
                      : ""}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    )}
  </div>
)}
</div>

      {/* RIGHT: System Interactive Utility Buttons & Actions */}
      <div className="flex items-center gap-3.5">

        {/* Network Toggle Button (Kept as a button since it opens a popover) */}
        <button
          onClick={() => setIsFriendsOpen(!isFriendsOpen)}
          className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 ${
            isFriendsOpen 
              ? 'bg-[#D2EBE1] border-[#B7DFCE] text-[#1E4620]' 
              : 'bg-white border-[#E1DDD4] text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <Users className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Chat Page Link */}
        <Link 
          to="/chat"
          className="w-11 h-11 rounded-full bg-white border border-[#E1DDD4] flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all relative"
        >
          <MessageSquare className="w-5 h-5 stroke-[2]" />
          {/* <span className="absolute -top-1 -right-1 bg-[#42C196] border-2 border-white text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
            2
          </span> */}
        </Link>

        {/* Notifications Page Link */}
        <Link 
          to="/notifications" // 🌟 Points to your notifications route path
          className="w-11 h-11 rounded-full bg-white border border-[#E1DDD4] flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all relative"
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          <span className="absolute -top-0.5 -right-0.5 bg-[#42C196] border-2 border-white w-3 h-3 rounded-full shadow-sm" />
        </Link>

        {/* PROFILE DROP-DOWN ANCHOR */}
        <div className="relative ml-1" data-profile-menu>
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-[#EFECE6] border border-[#E1DDD4] hover:border-gray-400/60 transition-all shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#274E37] text-white flex items-center justify-center text-xs font-bold tracking-wider shadow-inner">
              {initials}
            </div>
            <span className="text-gray-800 font-medium text-sm hidden sm:inline-block tracking-wide">
              {fullName}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Settings Dropdown Window Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-[#E1DDD4] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              <div className="p-3.5 bg-[#F6F4F0] rounded-xl border border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">{fullName}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
              </div>

              <div className="mt-2 space-y-0.5">
                {/* Linked Profile Pages */}
                <Link to="/profile?tab=overview" className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#F6F4F0] rounded-xl transition-colors">
                  <UserCircle2 size={16} className="text-gray-400" /> My Profile
                </Link>
                <Link to="/profile?tab=trips" className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#F6F4F0] rounded-xl transition-colors">
                  <MapPin size={16} className="text-gray-400" /> My Trips
                </Link>
                <Link to="/profile?tab=saved" className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#F6F4F0] rounded-xl transition-colors">
                  <Heart size={16} className="text-gray-400" /> Saved Places
                </Link>
                <Link to="/profile?tab=settings" className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#F6F4F0] rounded-xl transition-colors">
                  <Settings2 size={16} className="text-gray-400" /> Settings
                </Link>
                <Link to="/help" className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#F6F4F0] rounded-xl transition-colors">
                  <HelpCircle size={16} className="text-gray-400" /> Help Support
                </Link>
              </div>

              <div className="border-t border-gray-100 mt-1.5 pt-1.5">
                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50/60 rounded-xl transition-colors font-medium"
                >
                  <LogOut size={16} /> Logout Account
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Popover Element Container */}
        <FriendsPopover
          isOpen={isFriendsOpen}
          onClose={() => setIsFriendsOpen(false)}
        />
      </div>

    </header>
  );
}