import { useState } from 'react';
import { AlertTriangle, Clock, Ban, MessageSquareOff, CheckCircle2, X } from 'lucide-react';

const dummyReports = [
  { id: 1, name: 'spam_bot_123',  initials: 'SB', color: 'bg-pink-400', email: 'bot@malicious.net',  date: 'Dec 19, 2025', status: 'Pending', content: 'buy cheap followers here!! click this link → bit.ly/xXx123 guaranteed results 🔥🔥', reportedBy: ['reaksa@gmail.com'] },
  { id: 2, name: 'troll_user_99', initials: 'TU', color: 'bg-red-400',  email: 'fake_99@temp.net',   date: 'Dec 12, 2025', status: 'Pending', content: 'this place is terrible, all staff are [offensive content removed]', reportedBy: ['dara@gmail.com', 'maly@yahoo.com'] },
];

const dummyRestrictions = [
  { id: 1, name: 'troll_user_99', initials: 'TU', color: 'bg-red-400',   email: 'fake_99@temp.net',  date: 'Dec 2024', banType: 'full_ban',    timeLeft: null,       reason: 'Illegal content' },
  { id: 2, name: 'angry_kevin',   initials: 'AK', color: 'bg-orange-400', email: 'kevin@hotmail.com', date: 'Dec 2024', banType: 'restricted',  timeLeft: '3h left',  reason: 'Spam comments' },
  { id: 3, name: 'john_doe88',    initials: 'JD', color: 'bg-gray-500',   email: 'john@gmail.com',    date: 'Dec 2024', banType: 'comment_ban', timeLeft: null,       reason: 'Harassment' },
  { id: 4, name: 'Bopha Lim',     initials: 'BL', color: 'bg-stone-600',  email: 'bopha@outlook.com', date: 'Dec 2024', banType: 'none',        timeLeft: null,       reason: '' },
];

const durations = ['1 hour', '6 hours', '12 hours', '1 day', '3 days', '7 days', '30 days'];

// Ban type config
const banConfig = {
  full_ban:    { label: 'Full Ban',       badge: 'bg-red-100 text-red-600 border border-red-200',        desc: 'Cannot log in at all' },
  comment_ban: { label: 'Comment Ban',    badge: 'bg-orange-100 text-orange-600 border border-orange-200', desc: 'Cannot comment or review' },
  restricted:  { label: 'Restricted',     badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200', desc: 'Temporary comment restriction' },
  none:        { label: 'Active',         badge: 'bg-emerald-100 text-emerald-600 border border-emerald-200', desc: 'No restrictions' },
};

export default function Report() {
  const [tab, setTab]                       = useState('Reports');
  const [reports, setReports]               = useState(dummyReports);
  const [restrictions, setRestrictions]     = useState(dummyRestrictions);
  const [restrictSearch, setRestrictSearch] = useState('');
  const [restrictDuration, setRestrictDuration] = useState('1 hour');
  const [toast, setToast]                   = useState('');

  // Ban action modal state
  const [banModal, setBanModal]   = useState(null); // { reportId, type: 'full_ban' | 'comment_ban' }
  const [liftModal, setLiftModal] = useState(null); // restriction id

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // ── Reports actions ──
  const handleBanConfirm = () => {
    const { reportId, type } = banModal;
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setBanModal(null);
    const label = type === 'full_ban' ? 'fully banned' : 'comment banned';
    showToast(`✅ User has been ${label} successfully.`);
  };

  const handleDismiss = (id) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Dismissed' } : r));
    showToast('Report dismissed.');
  };

  // ── Restriction actions ──
  const handleLift = () => {
    setRestrictions((prev) => prev.map((r) => r.id === liftModal ? { ...r, banType: 'none', timeLeft: null, reason: '' } : r));
    setLiftModal(null);
    showToast('✅ Restriction lifted. User can now comment again.');
  };

  const handleApplyRestriction = () => {
    if (!restrictSearch.trim()) return;
    showToast(`⏱️ Restriction of "${restrictDuration}" applied to "${restrictSearch}".`);
    setRestrictSearch('');
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#C8A45A] italic mb-1">Report</h1>
      <p className="text-sm text-gray-400 mb-5">Manage reports, bans, and user restrictions</p>

      {/* Toast */}
      {toast && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Ban type legend */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Ban size={14} className="text-red-500" />
            <span className="text-xs font-semibold text-red-600">Full Ban</span>
          </div>
          <p className="text-[11px] text-gray-400">User <strong>cannot log in</strong> at all. Account is fully suspended. They must create a new account to access the app.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareOff size={14} className="text-orange-500" />
            <span className="text-xs font-semibold text-orange-600">Comment Ban</span>
          </div>
          <p className="text-[11px] text-gray-400">User <strong>can still log in</strong> and browse the app but <strong>cannot post comments</strong> or reviews permanently.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-700">Restriction</span>
          </div>
          <p className="text-[11px] text-gray-400">User <strong>can still log in</strong> but <strong>cannot comment</strong> until the time limit expires (1 hour to 30 days).</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        {['Reports', 'Restriction'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 max-w-[180px] py-2.5 text-sm font-semibold rounded-xl transition-all
              ${tab === t ? 'bg-[#C8A45A] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#C8A45A]'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── REPORTS TAB ── */}
      {tab === 'Reports' && (
        <div>
          <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 mb-4 inline-block">
            <p className="text-2xl font-bold text-orange-500">{reports.filter(r => r.status === 'Pending').length}</p>
            <p className="text-xs text-gray-400">Pending Reports</p>
          </div>

          <div className="flex flex-col gap-4">
            {reports.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl py-12 text-center text-sm text-gray-400">
                No pending reports 🎉
              </div>
            )}

            {reports.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full ${r.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                    {r.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#3d2e00]">{r.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">{r.status}</span>
                    </div>
                    <p className="text-xs text-gray-400">{r.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">Report {r.date}</span>
                </div>

                {/* Flagged content */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-3">
                  <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider mb-1">Flagged content</p>
                  <p className="text-sm text-gray-600 italic">"{r.content}"</p>
                </div>

                {/* Reported by */}
                <p className="text-xs text-gray-400 mb-2">Reported by:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {r.reportedBy.map((email) => (
                    <span key={email} className="text-[11px] px-3 py-1 bg-gray-100 rounded-full text-gray-500">{email}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-50 pt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 mr-1">Action:</span>

                  {/* Full ban */}
                  <button
                    onClick={() => setBanModal({ reportId: r.id, type: 'full_ban' })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all"
                  >
                    <Ban size={12} /> Full Ban
                  </button>

                  {/* Comment ban */}
                  <button
                    onClick={() => setBanModal({ reportId: r.id, type: 'comment_ban' })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all"
                  >
                    <MessageSquareOff size={12} /> Comment Ban
                  </button>

                  {/* Restrict */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                    <Clock size={12} className="text-yellow-600" />
                    <span className="text-xs text-gray-500">Restrict for</span>
                    <select
                      className="text-xs border-none bg-transparent text-gray-600 outline-none"
                      defaultValue="1 hour"
                    >
                      {durations.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <button className="text-xs text-yellow-700 font-semibold hover:text-yellow-800">Apply</button>
                  </div>

                  <div className="flex-1" />
                  <button
                    onClick={() => handleDismiss(r.id)}
                    className="px-3 py-2 text-xs border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESTRICTION TAB ── */}
      {tab === 'Restriction' && (
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1.5fr_1.5fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
              {['User', 'Email', 'Since', 'Status', 'Action'].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
              ))}
            </div>

            {restrictions.map((r) => {
              const config = banConfig[r.banType];
              return (
                <div key={r.id} className="grid grid-cols-[2fr_1.5fr_1.2fr_1.5fr_1.5fr] px-5 py-3.5 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-all">
                  {/* User */}
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${r.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                      {r.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3d2e00]">{r.name}</p>
                      {r.reason && <p className="text-[10px] text-gray-400">{r.reason}</p>}
                    </div>
                  </div>
                  {/* Email */}
                  <span className="text-xs text-gray-400">{r.email}</span>
                  {/* Since */}
                  <span className="text-xs text-gray-400">{r.date}</span>
                  {/* Status */}
                  <div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${config.badge}`}>
                      {config.label}
                    </span>
                    {r.timeLeft && (
                      <p className="text-[10px] text-yellow-600 mt-0.5 flex items-center gap-1">
                        <Clock size={9} /> {r.timeLeft}
                      </p>
                    )}
                  </div>
                  {/* Action */}
                  <div>
                    {r.banType !== 'none' ? (
                      <button
                        onClick={() => setLiftModal(r.id)}
                        className="px-3 py-1.5 text-xs border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all font-medium"
                      >
                        Lift restriction
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">No action needed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Restrict user form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[#3d2e00] mb-3">Manually Restrict a User</h3>
            <div className="flex gap-3 items-start flex-wrap">
              <div className="flex-1 min-w-48">
                <input
                  type="text"
                  placeholder="Search for user by name or email..."
                  value={restrictSearch}
                  onChange={(e) => setRestrictSearch(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <select
                value={restrictDuration}
                onChange={(e) => setRestrictDuration(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-emerald-400"
              >
                {durations.map((d) => <option key={d}>{d}</option>)}
              </select>
              <button
                onClick={handleApplyRestriction}
                className="px-4 py-2.5 bg-[#C8A45A] text-white text-sm font-semibold rounded-xl hover:bg-[#b8944a] transition-all whitespace-nowrap"
              >
                Apply restriction
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              ⏱️ The user will be unable to post comments or reviews until the time limit expires.
            </p>
          </div>
        </div>
      )}

      {/* ── BAN CONFIRM MODAL ── */}
      {banModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${banModal.type === 'full_ban' ? 'bg-red-50' : 'bg-orange-50'}`}>
              {banModal.type === 'full_ban'
                ? <Ban size={22} className="text-red-500" />
                : <MessageSquareOff size={22} className="text-orange-500" />
              }
            </div>
            <h2 className="text-base font-semibold text-[#3d2e00] text-center mb-2">
              {banModal.type === 'full_ban' ? 'Full Ban User?' : 'Comment Ban User?'}
            </h2>

            {banModal.type === 'full_ban' ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-red-700 font-semibold mb-1 flex items-center gap-1"><Ban size={11} /> Full Ban means:</p>
                <ul className="text-xs text-red-600 flex flex-col gap-1 list-disc list-inside">
                  <li>User <strong>cannot log in</strong> to their account</li>
                  <li>Account is fully suspended</li>
                  <li>They must create a new account to access the app</li>
                </ul>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-orange-700 font-semibold mb-1 flex items-center gap-1"><MessageSquareOff size={11} /> Comment Ban means:</p>
                <ul className="text-xs text-orange-600 flex flex-col gap-1 list-disc list-inside">
                  <li>User <strong>can still log in</strong> normally</li>
                  <li>User <strong>cannot post comments</strong> or reviews</li>
                  <li>This restriction is permanent until lifted</li>
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setBanModal(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleBanConfirm}
                className={`flex-1 py-2.5 text-sm text-white font-semibold rounded-xl transition-all
                  ${banModal.type === 'full_ban' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {banModal.type === 'full_ban' ? 'Yes, Full Ban' : 'Yes, Comment Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIFT CONFIRM MODAL ── */}
      {liftModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={22} className="text-emerald-500" />
            </div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-2">Lift Restriction?</h2>
            <p className="text-sm text-gray-400 mb-5">
              <strong>{restrictions.find(r => r.id === liftModal)?.name}</strong>'s restriction will be fully removed. They will be able to comment and use the app normally again.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setLiftModal(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleLift} className="flex-1 py-2.5 text-sm bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600">Yes, Lift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
