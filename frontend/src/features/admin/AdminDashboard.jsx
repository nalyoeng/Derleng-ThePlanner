import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { fetchAllUsers } from '../../lib/adminApi';

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
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All'   ? true :
      filter === 'Admin' ? adminRoles.includes(u.role) :
                           !adminRoles.includes(u.role);
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-[#C8A45A] italic">Dashboard</h1>
        <button
          onClick={loadUsers}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-all"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-5">Overview</p>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

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

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#C8A45A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Loading users...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No users found</div>
        )}

        {/* Rows */}
        {!loading && filtered.map((u) => (
          <div
            key={u.id}
            className={`grid grid-cols-[2fr_2fr_1fr_1fr] px-5 py-3 border-b border-gray-50 hover:bg-orange-50/30 transition-all items-center last:border-0
              ${u.ban_type !== 'none' ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                {u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
              <span className={`text-sm font-medium ${u.ban_type !== 'none' ? 'line-through text-gray-400' : 'text-[#3d2e00]'}`}>
                {u.full_name || u.email}
              </span>
            </div>
            <span className="text-sm text-gray-500">{u.email}</span>
            <span className="text-sm text-gray-400">
              {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
            </span>
            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full w-fit ${roleBadge[u.role] || 'bg-gray-100 text-gray-500'}`}>
              {roleLabel[u.role] || u.role}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      {!loading && (
        <div className="flex gap-3 mt-4">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-center">
            <p className="text-lg font-bold text-[#3d2e00]">{users.length}</p>
            <p className="text-[10px] text-gray-400">Total users</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-center">
            <p className="text-lg font-bold text-orange-500">{users.filter(u => adminRoles.includes(u.role)).length}</p>
            <p className="text-[10px] text-gray-400">Admins</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-center">
            <p className="text-lg font-bold text-red-500">{users.filter(u => u.ban_type !== 'none').length}</p>
            <p className="text-[10px] text-gray-400">Banned</p>
          </div>
        </div>
      )}
    </div>
  );
}
