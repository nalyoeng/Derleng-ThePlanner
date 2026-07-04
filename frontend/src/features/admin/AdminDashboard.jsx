import { useState } from 'react';
import { Search } from 'lucide-react';

const dummyUsers = [
  { id: 1, name: 'Sophea Vann',   initials: 'SV', color: 'bg-emerald-700', email: 'sophea@mittours.kh',   joined: 'Jan 2024', role: 'super_admin' },
  { id: 2, name: 'Dara Keo',      initials: 'DK', color: 'bg-yellow-600',  email: 'dara@gmail.com',        joined: 'Mar 2024', role: 'place_manager' },
  { id: 3, name: 'Maly Chan',     initials: 'MC', color: 'bg-teal-600',    email: 'maly.chan@yahoo.com',   joined: 'Feb 2024', role: 'moderator' },
  { id: 4, name: 'troll_user_99', initials: 'TU', color: 'bg-red-400',     email: 'fake_99@temp.net',      joined: 'Dec 2024', role: 'user', banned: true },
  { id: 5, name: 'spam_bot_123',  initials: 'SB', color: 'bg-pink-400',    email: 'bot@malicious.net',     joined: 'Dec 2024', role: 'user', banned: true },
  { id: 6, name: 'Reaksa Heng',   initials: 'RH', color: 'bg-purple-500',  email: 'reaksa@gmail.com',      joined: 'Jun 2024', role: 'user' },
  { id: 7, name: 'Bopha Lim',     initials: 'BL', color: 'bg-stone-600',   email: 'bopha.l@outlook.com',   joined: 'Apr 2024', role: 'user' },
];

const adminRoles = ['super_admin', 'place_manager', 'moderator'];

const roleLabel = {
  super_admin:   'Super Admin',
  place_manager: 'Place Manager',
  moderator:     'Moderator',
  user:          'User',
};

const roleBadge = {
  super_admin:   'bg-orange-100 text-orange-600',
  place_manager: 'bg-blue-100 text-blue-700',
  moderator:     'bg-purple-100 text-purple-700',
  user:          'bg-gray-100 text-gray-500',
};

export default function AdminDashboard() {
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');

  const filtered = dummyUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All'   ? true :
      filter === 'Admin' ? adminRoles.includes(u.role) :
                           !adminRoles.includes(u.role);
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#C8A45A] italic mb-1">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-5">Overview</p>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:border-emerald-400"
          />
        </div>
        {['All', 'User', 'Admin'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all
              ${filter === f
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
          {['USER', 'EMAIL', 'JOINED', 'ROLE'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No users found</div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.id}
              className={`grid grid-cols-[2fr_2fr_1fr_1fr] px-5 py-3 border-b border-gray-50 hover:bg-orange-50/30 transition-all items-center last:border-0
                ${u.banned ? 'opacity-50' : ''}`}
            >
              {/* User */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                  {u.initials}
                </div>
                <span className={`text-sm font-medium ${u.banned ? 'line-through text-gray-400' : 'text-[#3d2e00]'}`}>
                  {u.name}
                </span>
              </div>
              {/* Email */}
              <span className="text-sm text-gray-500">{u.email}</span>
              {/* Joined */}
              <span className="text-sm text-gray-400">{u.joined}</span>
              {/* Role */}
              <span className={`text-[11px] font-semibold px-3 py-1 rounded-full w-fit ${roleBadge[u.role]}`}>
                {roleLabel[u.role]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
