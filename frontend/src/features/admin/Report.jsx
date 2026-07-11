import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Ban, MessageSquareOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { fetchAllReports, fetchAllRestrictions, dismissReport, banUser, restrictUser, liftRestriction } from '../../lib/adminApi';

const durations = ['1 hour', '6 hours', '12 hours', '1 day', '3 days', '7 days', '30 days'];

const banConfig = {
  full_ban:    { label: 'Full Ban',    badge: 'bg-red-100 text-red-600 border border-red-200' },
  comment_ban: { label: 'Comment Ban', badge: 'bg-orange-100 text-orange-600 border border-orange-200' },
  restricted:  { label: 'Restricted',  badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  none:        { label: 'Active',      badge: 'bg-emerald-100 text-emerald-600 border border-emerald-200' },
};

export default function Report() {
  const [tab, setTab]                         = useState('Reports');
  const [reports, setReports]                 = useState([]);
  const [restrictions, setRestrictions]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [restrictSearch, setRestrictSearch]   = useState('');
  const [restrictDuration, setRestrictDuration] = useState('1 hour');
  const [toast, setToast]                     = useState('');
  const [error, setError]                     = useState('');
  const [banModal, setBanModal]               = useState(null);
  const [liftModal, setLiftModal]             = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchAllReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const loadRestrictions = async () => {
    try {
      setLoading(true);
      const data = await fetchAllRestrictions();
      setRestrictions(data);
    } catch (err) {
      setError('Failed to load restrictions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'Reports') loadReports();
    else loadRestrictions();
  }, [tab]);

  const handleDismiss = async (id) => {
    try {
      await dismissReport(id);
      showToast('Report dismissed.');
      await loadReports();
    } catch (err) {
      setError('Failed to dismiss report.');
    }
  };

  const handleBanConfirm = async () => {
    try {
      const { userId, type, reportId } = banModal;
      await banUser(userId, type, null, reportId);
      setBanModal(null);
      showToast(`✅ User has been ${type === 'full_ban' ? 'fully banned' : 'comment banned'}.`);
      await loadReports();
    } catch (err) {
      setError('Failed to ban user.');
      setBanModal(null);
    }
  };

  const handleApplyRestriction = async () => {
    if (!restrictSearch.trim()) return;
    try {
      const user = restrictions.find(r =>
        r.user?.email?.toLowerCase().includes(restrictSearch.toLowerCase()) ||
        r.user?.full_name?.toLowerCase().includes(restrictSearch.toLowerCase())
      );
      if (!user) { setError('User not found.'); return; }
      await restrictUser(user.user_id, restrictDuration, null, null);
      showToast(`⏱️ Restriction of "${restrictDuration}" applied.`);
      setRestrictSearch('');
      await loadRestrictions();
    } catch (err) {
      setError('Failed to apply restriction.');
    }
  };

  const handleLift = async () => {
    try {
      const restriction = restrictions.find(r => r.id === liftModal);
      await liftRestriction(restriction.user_id);
      setLiftModal(null);
      showToast('✅ Restriction lifted successfully.');
      await loadRestrictions();
    } catch (err) {
      setError('Failed to lift restriction.');
      setLiftModal(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-[#C8A45A] italic">Report</h1>
        <button onClick={() => tab === 'Reports' ? loadReports() : loadRestrictions()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-5">Manage reports, bans, and user restrictions</p>

      {toast && <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl"><CheckCircle2 size={16} />{toast}</div>}
      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

      {/* Ban type legend */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1"><Ban size={14} className="text-red-500" /><span className="text-xs font-semibold text-red-600">Full Ban</span></div>
          <p className="text-[11px] text-gray-400">User <strong>cannot log in</strong> at all. Must create a new account.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1"><MessageSquareOff size={14} className="text-orange-500" /><span className="text-xs font-semibold text-orange-600">Comment Ban</span></div>
          <p className="text-[11px] text-gray-400">Can still log in but <strong>cannot post comments</strong> permanently.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1"><Clock size={14} className="text-yellow-600" /><span className="text-xs font-semibold text-yellow-700">Restriction</span></div>
          <p className="text-[11px] text-gray-400">Cannot comment until the <strong>time limit expires</strong>.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        {['Reports', 'Restriction'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 max-w-[180px] py-2.5 text-sm font-semibold rounded-xl transition-all ${tab === t ? 'bg-[#C8A45A] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#C8A45A]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* REPORTS TAB */}
      {tab === 'Reports' && (
        <div>
          <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 mb-4 inline-block">
            <p className="text-2xl font-bold text-orange-500">{reports.filter(r => r.status === 'Pending').length}</p>
            <p className="text-xs text-gray-400">Pending Reports</p>
          </div>

          {loading && <div className="bg-white border border-gray-100 rounded-2xl py-12 text-center text-sm text-gray-400">Loading reports...</div>}
          {!loading && reports.length === 0 && <div className="bg-white border border-gray-100 rounded-2xl py-12 text-center text-sm text-gray-400">No reports yet 🎉</div>}

          <div className="flex flex-col gap-4">
            {!loading && reports.filter(r => r.status === 'Pending').map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-red-400 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {r.reported_user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#3d2e00]">{r.reported_user?.full_name || r.reported_user?.email}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">{r.status}</span>
                    </div>
                    <p className="text-xs text-gray-400">{r.reported_user?.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-3">
                  <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider mb-1">Flagged content</p>
                  <p className="text-sm text-gray-600 italic">"{r.content}"</p>
                </div>

                <p className="text-xs text-gray-400 mb-2">Reported by: <span className="text-gray-600">{r.reported_by?.full_name || r.reported_by?.email}</span></p>
                <p className="text-xs text-gray-400 mb-4">Reason: <span className="font-medium text-gray-600">{r.reason}</span></p>

                <div className="border-t border-gray-50 pt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 mr-1">Action:</span>
                  <button onClick={() => setBanModal({ userId: r.reported_user_id, type: 'full_ban', reportId: r.id })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all">
                    <Ban size={12} /> Full Ban
                  </button>
                  <button onClick={() => setBanModal({ userId: r.reported_user_id, type: 'comment_ban', reportId: r.id })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all">
                    <MessageSquareOff size={12} /> Comment Ban
                  </button>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                    <Clock size={12} className="text-yellow-600" />
                    <span className="text-xs text-gray-500">Restrict for</span>
                    <select className="text-xs border-none bg-transparent text-gray-600 outline-none" defaultValue="1 hour"
                      onChange={(e) => setRestrictDuration(e.target.value)}>
                      {durations.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <button onClick={async () => {
                      await restrictUser(r.reported_user_id, restrictDuration, r.reason, r.id);
                      showToast('⏱️ Restriction applied.');
                      await loadReports();
                    }} className="text-xs text-yellow-700 font-semibold hover:text-yellow-800">Apply</button>
                  </div>
                  <div className="flex-1" />
                  <button onClick={() => handleDismiss(r.id)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESTRICTION TAB */}
      {tab === 'Restriction' && (
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
            <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1.5fr_1.5fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
              {['User', 'Email', 'Since', 'Status', 'Action'].map(h => (
                <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
              ))}
            </div>

            {loading && <div className="py-10 text-center text-sm text-gray-400">Loading...</div>}
            {!loading && restrictions.length === 0 && <div className="py-10 text-center text-sm text-gray-400">No restrictions found</div>}

            {!loading && restrictions.map((r) => {
              const banType = r.type === 'restricted' ? 'restricted' : r.user?.ban_type || 'none';
              const config  = banConfig[banType] || banConfig['none'];
              return (
                <div key={r.id} className="grid grid-cols-[2fr_1.5fr_1.2fr_1.5fr_1.5fr] px-5 py-3.5 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {r.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3d2e00]">{r.user?.full_name}</p>
                      {r.reason && <p className="text-[10px] text-gray-400">{r.reason}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{r.user?.email}</span>
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  <div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${config.badge}`}>{config.label}</span>
                    {r.restricted_until && (
                      <p className="text-[10px] text-yellow-600 mt-0.5 flex items-center gap-1">
                        <Clock size={9} /> Until {new Date(r.restricted_until).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div>
                    {r.is_active ? (
                      <button onClick={() => setLiftModal(r.id)}
                        className="px-3 py-1.5 text-xs border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all font-medium">
                        Lift restriction
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">Lifted</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual restrict form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[#3d2e00] mb-3">Manually Restrict a User</h3>
            <div className="flex gap-3 items-center flex-wrap">
              <input type="text" placeholder="Search for user by name or email..." value={restrictSearch} onChange={(e) => setRestrictSearch(e.target.value)}
                className="flex-1 min-w-48 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-emerald-400" />
              <select value={restrictDuration} onChange={(e) => setRestrictDuration(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-emerald-400">
                {durations.map(d => <option key={d}>{d}</option>)}
              </select>
              <button onClick={handleApplyRestriction}
                className="px-4 py-2.5 bg-[#C8A45A] text-white text-sm font-semibold rounded-xl hover:bg-[#b8944a] transition-all whitespace-nowrap">
                Apply restriction
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">⏱️ The user will be unable to post comments until the time limit expires.</p>
          </div>
        </div>
      )}

      {/* Ban confirm modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${banModal.type === 'full_ban' ? 'bg-red-50' : 'bg-orange-50'}`}>
              {banModal.type === 'full_ban' ? <Ban size={22} className="text-red-500" /> : <MessageSquareOff size={22} className="text-orange-500" />}
            </div>
            <h2 className="text-base font-semibold text-[#3d2e00] text-center mb-2">
              {banModal.type === 'full_ban' ? 'Full Ban User?' : 'Comment Ban User?'}
            </h2>
            {banModal.type === 'full_ban' ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <ul className="text-xs text-red-600 flex flex-col gap-1 list-disc list-inside">
                  <li>User <strong>cannot log in</strong> to their account</li>
                  <li>Account is fully suspended</li>
                  <li>They must create a new account to access the app</li>
                </ul>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-5">
                <ul className="text-xs text-orange-600 flex flex-col gap-1 list-disc list-inside">
                  <li>User <strong>can still log in</strong> normally</li>
                  <li>User <strong>cannot post comments</strong> or reviews</li>
                  <li>This restriction is permanent until lifted</li>
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setBanModal(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500">Cancel</button>
              <button onClick={handleBanConfirm}
                className={`flex-1 py-2.5 text-sm text-white font-semibold rounded-xl transition-all ${banModal.type === 'full_ban' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
                {banModal.type === 'full_ban' ? 'Yes, Full Ban' : 'Yes, Comment Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lift confirm modal */}
      {liftModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={22} className="text-emerald-500" /></div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-2">Lift Restriction?</h2>
            <p className="text-sm text-gray-400 mb-5">This user's restriction will be fully removed and they can comment again.</p>
            <div className="flex gap-2">
              <button onClick={() => setLiftModal(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500">Cancel</button>
              <button onClick={handleLift} className="flex-1 py-2.5 text-sm bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600">Yes, Lift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
