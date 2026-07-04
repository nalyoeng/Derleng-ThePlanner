import { useState } from 'react';
import { UserMinus, Eye, EyeOff } from 'lucide-react';

const initialAdmins = [
  { id: 1, name: 'Dara Keo',  initials: 'DK', color: 'bg-yellow-600', email: 'dara@gmail.com',       role: 'place_manager', created: 'Jan 10, 2025' },
  { id: 2, name: 'Maly Chan', initials: 'MC', color: 'bg-teal-600',   email: 'maly.chan@yahoo.com',  role: 'moderator',     created: 'Feb 3, 2025'  },
];

const roleLabel = { place_manager: 'Place Manager', moderator: 'Moderator' };
const roleBadge = { place_manager: 'bg-blue-100 text-blue-700', moderator: 'bg-purple-100 text-purple-700' };

const emptyForm = { name: '', email: '', password: '', role: '' };

export default function CreateAdmin() {
  const [admins, setAdmins]         = useState(initialAdmins);
  const [form, setForm]             = useState(emptyForm);
  const [showPass, setShowPass]     = useState(false);
  const [revokeId, setRevokeId]     = useState(null);
  const [editRoleId, setEditRoleId] = useState(null);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const handleCreate = () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      setError('Please fill in all fields.'); return;
    }
    setAdmins((prev) => [...prev, {
      id: Date.now(), name: form.name, initials: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2),
      color: 'bg-gray-500', email: form.email, role: form.role,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }]);
    setForm(emptyForm); setError(''); setSuccess(`Admin "${form.name}" created successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRevoke = () => {
    setAdmins((prev) => prev.filter((a) => a.id !== revokeId));
    setRevokeId(null);
  };

  const handleEditRole = (id, newRole) => {
    setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, role: newRole } : a));
    setEditRoleId(null);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#C8A45A] italic mb-1">Create New Admin</h1>
      <p className="text-sm text-gray-400 mb-5">Add a new admin account and assign their role</p>

      {/* Create form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        {success && <div className="mb-4 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-200">{success}</div>}
        {error   && <div className="mb-4 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">{error}</div>}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
            <input
              type="text" placeholder="e.g Dara Keo"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 text-sm bg-[#4A5568] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input
              type="email" placeholder="dara@gmail.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 text-sm bg-[#4A5568] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} placeholder="Set a password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-[#4A5568] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Assign Role</label>
            <select
              value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 text-sm bg-[#4A5568] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none"
            >
              <option value="">Select Role...</option>
              <option value="place_manager">Place Manager</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="w-full py-3 bg-[#C8A45A] text-white font-semibold rounded-xl hover:bg-[#b8944a] transition-all text-sm"
        >
          Create Admin
        </button>
      </div>

      {/* Existing admins */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#3d2e00]">Existing Admins</h2>
        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{admins.length} admins</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1.8fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
          {['Admin', 'Role', 'Created', 'Status', 'Actions'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {admins.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">No admins yet</div>
        )}

        {admins.map((a) => (
          <div key={a.id} className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1.8fr] px-5 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-orange-50/20 transition-all">
            {/* Admin */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${a.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                {a.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-[#3d2e00]">{a.name}</p>
                <p className="text-[11px] text-gray-400">{a.email}</p>
              </div>
            </div>

            {/* Role — editable */}
            <div>
              {editRoleId === a.id ? (
                <select
                  defaultValue={a.role}
                  onChange={(e) => handleEditRole(a.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-400"
                  autoFocus
                >
                  <option value="place_manager">Place Manager</option>
                  <option value="moderator">Moderator</option>
                </select>
              ) : (
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${roleBadge[a.role]}`}>
                  {roleLabel[a.role]}
                </span>
              )}
            </div>

            {/* Created */}
            <span className="text-xs text-gray-400">{a.created}</span>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-emerald-600">Active</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditRoleId(editRoleId === a.id ? null : a.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#C8B89A] bg-[#FFF8EE] text-[#8B6914] rounded-lg hover:border-orange-400 transition-all"
              >
                Edit role
              </button>
              <button
                onClick={() => setRevokeId(a.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-red-200 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all font-medium"
              >
                <UserMinus size={12} /> Revoke
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-red-400 mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
        ⚠️ Revoking an admin demotes them back to a regular user. Their account is not deleted — they just lose admin access immediately.
      </p>

      {/* Revoke confirm modal */}
      {revokeId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserMinus size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-1">Revoke Admin Access</h2>
            <p className="text-sm text-gray-400 mb-5">
              This will demote <strong>{admins.find(a => a.id === revokeId)?.name}</strong> back to a regular user.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setRevokeId(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleRevoke} className="flex-1 py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600">Revoke</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
