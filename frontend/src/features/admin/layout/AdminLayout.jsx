import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, UserPlus, Database,
  RefreshCw, Flag, Bell, ChevronDown, LogOut
} from 'lucide-react';
import logoImg from '../../../assets/logo-no-bg.jpg';

// --- Role-based sidebar nav config ---
const allNavItems = [
  {
    label: 'Dashboard',
    sub: 'Overview',
    icon: LayoutDashboard,
    to: '/admin/dashboard',
    roles: ['super_admin'],
  },
  {
    label: 'Destination Manager',
    sub: 'CRUD for places',
    icon: MapPin,
    to: '/admin/destinations',
    roles: ['super_admin', 'place_manager'],
  },
  {
    label: 'Create Admin',
    sub: 'New Admin',
    icon: UserPlus,
    to: '/admin/create-admin',
    roles: ['super_admin'],
  },
  {
    label: 'Backup Button',
    sub: 'Backup Database',
    icon: Database,
    to: '/admin/backup',
    roles: ['super_admin'],
  },
  {
    label: 'Recover Button',
    sub: 'Recover Database',
    icon: RefreshCw,
    to: '/admin/recover',
    roles: ['super_admin'],
  },
  {
    label: 'Report',
    sub: 'Banned & Restrict',
    icon: Flag,
    to: '/admin/report',
    roles: ['super_admin', 'moderator'],
  },
];

// Dummy user — replace with real auth context later
const currentUser = {
  name: 'Sophea Vann',
  initials: 'SV',
  role: 'super_admin', // change to 'place_manager' or 'moderator' to test
};

const roleLabel = {
  super_admin: 'Super Admin',
  place_manager: 'Place Manager',
  moderator: 'Moderator',
};
// add prop
export default function AdminLayout({role,onLogout,}) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const visibleNav = allNavItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );
  //add
  const handleLogout = async () => {
  await onLogout?.()
 }

  return (
    <div className="flex h-screen bg-[#faf8f3] font-sans overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
          <img src={logoImg} alt="Der Leng" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-sm font-bold tracking-widest text-[#3d2e00]">DER LENG</span>
        </div>

        {/* Panel label */}
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Admin Panel</p>
          <p className="text-[11px] text-gray-400">MitTours Control Center</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 mt-2">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm transition-all
                  ${isActive
                    ? 'bg-orange-50 text-orange-500 font-semibold border-l-2 border-orange-400'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`
                }
              >
                <Icon size={16} className="flex-shrink-0" />
                <div>
                  <p className="text-[13px] leading-tight">{item.label}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{item.sub}</p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* System status + user */}
        <div className="p-3 border-t border-gray-100">
          <div className="bg-orange-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-[10px] font-semibold text-orange-400 mb-1">System Status</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-[11px] text-gray-500">All systems operational</span>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {currentUser.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#3d2e00] truncate">{currentUser.name}</p>
              <p className="text-[10px] text-gray-400">{roleLabel[currentUser.role]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
            Admin Control Panel
          </span>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50">
              <Bell size={16} className="text-emerald-500" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-100 hover:bg-gray-50 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold">
                  {currentUser.initials}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-11 bg-white border border-gray-100 rounded-xl shadow-lg w-44 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-800">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-400">{roleLabel[currentUser.role]}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
