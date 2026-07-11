import { useState, useEffect } from 'react';
import { UserMinus, Eye, EyeOff, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { fetchAllUsers, createAdmin, revokeAdmin, editAdminRole } from '../../lib/adminApi';

const adminRoles    = ['place_manager', 'moderator'];
const roleLabel     = { place_manager: 'Place Manager', moderator: 'Moderator' };
const roleBadge     = { place_manager: 'bg-blue-100 text-blue-700', moderator: 'bg-purple-100 text-purple-700' };
const emptyForm     = { name: '', email: '', password: '', confirmPassword: '', role: '' };
const emptyErrors   = { name: '', email: '', password: '', confirmPassword: '', role: '' };

const passwordRules = [
  { label: 'At least 8 characters',                   test: (p) => p.length >= 8 },
  { label: 'At least one uppercase letter',            test: (p) => /[A-Z]/.test(p) },
  { label: 'At least one number',                      test: (p) => /[0-9]/.test(p) },
  { label: 'At least one special character (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const getStrength = (p) => {
  const passed = passwordRules.filter(r => r.test(p)).length;
  if (passed <= 1) return { label: 'Weak',   color: 'bg-red-400',    width: 'w-1/4' };
  if (passed === 2) return { label: 'Fair',   color: 'bg-orange-400', width: 'w-2/4' };
  if (passed === 3) return { label: 'Good',   color: 'bg-yellow-400', width: 'w-3/4' };
  return               { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
};

export default function CreateAdmin() {
  const [admins, setAdmins]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [errors, setErrors]           = useState(emptyErrors);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [revokeId, setRevokeId]       = useState(null);
  const [editRoleId, setEditRoleId]   = useState(null);
  const [toast, setToast]             = useState('');
  const [error, setError]             = useState('');

  const strength = form.password ? getStrength(form.password) : null;
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setAdmins(data.filter(u => adminRoles.includes(u.role)));
    } catch (err) {
      setError('Failed to load admins.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const validate = () => {
    const e = { ...emptyErrors };
    let valid = true;

    if (!form.name.trim()) { e.name = 'Full name is required.'; valid = false; }
    else if (form.name.trim().length < 2) { e.name = 'Name must be at least 2 characters.'; valid = false; }
    else if (/[0-9]/.test(form.name)) { e.name = 'Name cannot contain numbers.'; valid = false; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) { e.email = 'Email is required.'; valid = false; }
    else if (!emailRegex.test(form.email)) { e.email = 'Please enter a valid email address.'; valid = false; }

    if (!form.password) { e.password = 'Password is required.'; valid = false; }
    else {
      const failed = passwordRules.filter(r => !r.test(form.password));
      if (failed.length > 0) { e.password = failed[0].label + ' is required.'; valid = false; }
    }

    if (!form.confirmPassword) { e.confirmPassword = 'Please confirm the password.'; valid = false; }
    else if (form.password !== form.confirmPassword) { e.confirmPassword = 'Passwords do not match.'; valid = false; }

    if (!form.role) { e.role = 'Please select a role.'; valid = false; }

    setErrors(e);
    return valid;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await createAdmin({ full_name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, role: form.role });
      setForm(emptyForm);
      setErrors(emptyErrors);
      showToast(`✅ Admin account for "${form.name.trim()}" created successfully!`);
      await loadAdmins();
    } catch (err) {
      setErrors(p => ({ ...p, email: err.response?.data?.error || 'Failed to create admin.' }));
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    try {
      const admin = admins.find(a => a.id === revokeId);
      await revokeAdmin(revokeId);
      setRevokeId(null);
      showToast(`✅ ${admin?.full_name}'s admin access has been revoked.`);
      await loadAdmins();
    } catch (err) {
      setError('Failed to revoke admin.');
      setRevokeId(null);
    }
  };

  const handleEditRole = async (id, newRole) => {
    try {
      await editAdminRole(id, newRole);
      setEditRoleId(null);
      showToast('✅ Role updated successfully.');
      await loadAdmins();
    } catch (err) {
      setError('Failed to update role.');
    }
  };

  const updateField = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-[#C8A45A] italic">Create New Admin</h1>
        <button onClick={loadAdmins} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-5">Add a new admin account and assign their role</p>

      {toast && <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl"><CheckCircle2 size={16} />{toast}</div>}
      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

      {/* Create form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Full Name <span className="text-red-400">*</span></label>
            <input type="text" placeholder="e.g. Dara Keo" value={form.name} onChange={(e) => updateField('name', e.target.value)}
              className={`w-full px-4 py-3 text-sm bg-[#4A5568] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-red-400' : 'focus:ring-emerald-400'}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email <span className="text-red-400">*</span></label>
            <input type="email" placeholder="dara@gmail.com" value={form.email} onChange={(e) => updateField('email', e.target.value)}
              className={`w-full px-4 py-3 text-sm bg-[#4A5568] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email ? 'ring-2 ring-red-400' : 'focus:ring-emerald-400'}`} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="Set a password" value={form.password} onChange={(e) => updateField('password', e.target.value)}
                className={`w-full px-4 py-3 text-sm bg-[#4A5568] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.password ? 'ring-2 ring-red-400' : 'focus:ring-emerald-400'}`} />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            {form.password && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-gray-400">Strength</span>
                  <span className={`text-[10px] font-semibold ${strength.label === 'Weak' ? 'text-red-500' : strength.label === 'Fair' ? 'text-orange-500' : strength.label === 'Good' ? 'text-yellow-600' : 'text-emerald-600'}`}>{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {passwordRules.map(rule => {
                    const passed = rule.test(form.password);
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        {passed ? <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" /> : <XCircle size={11} className="text-gray-300 flex-shrink-0" />}
                        <span className={`text-[10px] ${passed ? 'text-emerald-600' : 'text-gray-400'}`}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Confirm Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 text-sm bg-[#4A5568] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? 'ring-2 ring-red-400' : 'focus:ring-emerald-400'}`} />
              <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            {form.confirmPassword && !errors.confirmPassword && form.password === form.confirmPassword && (
              <div className="flex items-center gap-1 mt-1"><CheckCircle2 size={11} className="text-emerald-500" /><span className="text-[10px] text-emerald-600">Passwords match</span></div>
            )}
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Assign Role <span className="text-red-400">*</span></label>
            <select value={form.role} onChange={(e) => updateField('role', e.target.value)}
              className={`w-full px-4 py-3 text-sm bg-[#4A5568] text-white rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none ${errors.role ? 'ring-2 ring-red-400' : 'focus:ring-emerald-400'}`}>
              <option value="">Select Role...</option>
              <option value="place_manager">Place Manager</option>
              <option value="moderator">Moderator</option>
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>
        </div>
        <p className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-4">
          🔒 Password will be securely hashed on the server before being saved.
        </p>
        <button onClick={handleCreate} disabled={saving}
          className="w-full py-3 bg-[#C8A45A] text-white font-semibold rounded-xl hover:bg-[#b8944a] transition-all text-sm disabled:opacity-60">
          {saving ? 'Creating...' : 'Create Admin'}
        </button>
      </div>

      {/* Existing admins */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#3d2e00]">Existing Admins</h2>
        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{admins.length} admins</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1.8fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
          {['Admin', 'Role', 'Created', 'Status', 'Actions'].map(h => (
            <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading && <div className="py-10 text-center text-sm text-gray-400">Loading admins...</div>}
        {!loading && admins.length === 0 && <div className="py-10 text-center text-sm text-gray-400">No admins yet</div>}

        {!loading && admins.map((a) => (
          <div key={a.id} className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1.8fr] px-5 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-orange-50/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                {a.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'}
              </div>
              <div>
                <p className="text-sm font-medium text-[#3d2e00]">{a.full_name}</p>
                <p className="text-[11px] text-gray-400">{a.email}</p>
              </div>
            </div>
            <div>
              {editRoleId === a.id ? (
                <select defaultValue={a.role} onChange={(e) => handleEditRole(a.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-400" autoFocus>
                  <option value="place_manager">Place Manager</option>
                  <option value="moderator">Moderator</option>
                </select>
              ) : (
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${roleBadge[a.role]}`}>{roleLabel[a.role]}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </span>
            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span className="text-xs text-emerald-600">Active</span></div>
            <div className="flex gap-2">
              <button onClick={() => setEditRoleId(editRoleId === a.id ? null : a.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#C8B89A] bg-[#FFF8EE] text-[#8B6914] rounded-lg hover:border-orange-400 transition-all">
                Edit role
              </button>
              <button onClick={() => setRevokeId(a.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-red-200 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all font-medium">
                <UserMinus size={12} /> Revoke
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-red-400 mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
        ⚠️ Revoking an admin demotes them back to a regular user. Their account is not deleted.
      </p>

      {/* Revoke confirm */}
      {revokeId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><UserMinus size={20} className="text-red-500" /></div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-1">Revoke Admin Access</h2>
            <p className="text-sm text-gray-400 mb-5">This will demote <strong>{admins.find(a => a.id === revokeId)?.full_name}</strong> back to a regular user.</p>
            <div className="flex gap-2">
              <button onClick={() => setRevokeId(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500">Cancel</button>
              <button onClick={handleRevoke} className="flex-1 py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600">Revoke</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
