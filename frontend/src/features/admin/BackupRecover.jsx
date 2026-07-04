import { useState } from 'react';
import { Database, Download, RotateCcw, Plus, AlertTriangle, CheckCircle2, Clock, HardDrive, Trash2, X } from 'lucide-react';

const initialBackups = [
  { id: 1, filename: 'backup_2025-12-19_10-30.sql', date: 'Dec 19, 2025', time: '10:30 AM', size: '2.4 MB', status: 'success' },
  { id: 2, filename: 'backup_2025-12-15_09-00.sql', date: 'Dec 15, 2025', time: '09:00 AM', size: '2.1 MB', status: 'success' },
  { id: 3, filename: 'backup_2025-12-10_14-45.sql', date: 'Dec 10, 2025', time: '02:45 PM', size: '1.9 MB', status: 'success' },
  { id: 4, filename: 'backup_2025-12-05_11-20.sql', date: 'Dec 05, 2025', time: '11:20 AM', size: '1.7 MB', status: 'success' },
];

// ─── BACKUP PAGE ───────────────────────────────────────────────────────────────
export function Backup() {
  const [backups, setBackups]   = useState(initialBackups);
  const [loading, setLoading]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleBackup = () => {
    setLoading(true);
    setTimeout(() => {
      const now  = new Date();
      const date = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const pad  = (n) => String(n).padStart(2, '0');
      const filename = `backup_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.sql`;

      setBackups((prev) => [{ id: Date.now(), filename, date, time, size: '2.5 MB', status: 'success' }, ...prev]);
      setLoading(false);
      showToast('✅ Database backed up successfully!');
    }, 2500);
  };

  const handleDownload = (backup) => {
    // In real app this would download the actual .sql file from backend
    // For now we simulate by creating a dummy text file
    const content = `-- Der Leng Database Backup\n-- Date: ${backup.date} ${backup.time}\n-- File: ${backup.filename}\n\n-- SQL dump would be here...`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = backup.filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📥 Downloaded ${backup.filename}`);
  };

  const handleDelete = () => {
    setBackups((prev) => prev.filter((b) => b.id !== deleteId));
    setDeleteId(null);
    showToast('🗑️ Backup file deleted.');
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#C8A45A] italic mb-1">Backup</h1>
      <p className="text-sm text-gray-400 mb-5">Create and manage database backup files</p>

      {/* Toast */}
      {toast && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <p className="text-xl font-bold text-[#3d2e00]">{backups.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total backups</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <p className="text-xl font-bold text-[#3d2e00]">{backups[0]?.date ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">Last backup</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
          <p className="text-xl font-bold text-emerald-600">{backups.length > 0 ? 'Healthy' : 'No backups'}</p>
          <p className="text-xs text-gray-400 mt-0.5">Database status</p>
        </div>
      </div>

      {/* Backup now card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
          <Database size={32} strokeWidth={1.5} className="text-orange-400" />
        </div>
        <h2 className="text-sm font-semibold text-[#3d2e00] mb-1">Create New Backup</h2>
        <p className="text-xs text-gray-400 mb-5 max-w-sm">
          This will export the current state of your database into a <strong>.sql</strong> file and save it to the backup list below. You can download or restore it anytime.
        </p>
        <button
          onClick={handleBackup}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C8A45A] text-white text-sm font-semibold rounded-xl hover:bg-[#b8944a] transition-all disabled:opacity-60"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Backing up...</>
          ) : (
            <><Plus size={16} /> Backup Now</>
          )}
        </button>
      </div>

      {/* Backup list */}
      <h2 className="text-sm font-semibold text-[#3d2e00] mb-3">Backup History</h2>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1.2fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
          {['File Name', 'Date', 'Time', 'Size', 'Actions'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {backups.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No backups yet. Create your first backup above.</div>
        )}

        {backups.map((b) => (
          <div key={b.id} className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1.2fr] px-5 py-3.5 border-b border-gray-50 last:border-0 items-center hover:bg-orange-50/20 transition-all">
            {/* Filename */}
            <div className="flex items-center gap-2">
              <HardDrive size={14} className="text-gray-300 flex-shrink-0" />
              <span className="text-xs font-medium text-[#3d2e00] truncate">{b.filename}</span>
            </div>
            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-gray-300" />
              <span className="text-xs text-gray-500">{b.date}</span>
            </div>
            {/* Time */}
            <span className="text-xs text-gray-400">{b.time}</span>
            {/* Size */}
            <span className="text-xs text-gray-400">{b.size}</span>
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(b)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-all"
              >
                <Download size={12} /> Download
              </button>
              <button
                onClick={() => setDeleteId(b.id)}
                className="p-1.5 border border-red-100 rounded-lg text-red-400 hover:bg-red-50 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-1">Delete Backup?</h2>
            <p className="text-sm text-gray-400 mb-5">This backup file will be permanently deleted and cannot be recovered.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECOVER PAGE ──────────────────────────────────────────────────────────────
export function Recover() {
  const [backups]             = useState(initialBackups);
  const [confirmId, setConfirmId] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const handleRestore = () => {
    const backup = backups.find((b) => b.id === confirmId);
    setConfirmId(null);
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      showToast(`✅ Database restored from "${backup.filename}" successfully!`);
    }, 3000);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#C8A45A] italic mb-1">Recover</h1>
      <p className="text-sm text-gray-400 mb-5">Restore your database from a previous backup file</p>

      {/* Toast */}
      {toast && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Restoring overlay */}
      {restoring && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center gap-4">
            <span className="w-10 h-10 border-4 border-[#C8A45A] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-sm font-semibold text-[#3d2e00]">Restoring database...</p>
            <p className="text-xs text-gray-400">Please do not close this window</p>
          </div>
        </div>
      )}

      {/* Warning banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl mb-5">
        <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-orange-700">
          <strong>Warning:</strong> Restoring a backup will overwrite your current database with the selected backup. This action cannot be undone. Make sure to create a fresh backup before restoring.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-[#3d2e00] mb-3">How recovery works</h2>
        <div className="flex items-start gap-8">
          {[
            { step: '1', label: 'Choose a backup file from the list below' },
            { step: '2', label: 'Click Restore on the backup you want' },
            { step: '3', label: 'Confirm the action in the popup' },
            { step: '4', label: 'Database is restored to that point in time' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-2 flex-1">
              <div className="w-5 h-5 rounded-full bg-[#C8A45A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Backup list to restore from */}
      <h2 className="text-sm font-semibold text-[#3d2e00] mb-3">Available Backup Files</h2>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
          {['File Name', 'Date', 'Time', 'Size', 'Action'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {backups.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No backup files found. Go to Backup page to create one first.</div>
        )}

        {backups.map((b, i) => (
          <div key={b.id} className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1fr] px-5 py-3.5 border-b border-gray-50 last:border-0 items-center hover:bg-orange-50/20 transition-all">
            <div className="flex items-center gap-2">
              <HardDrive size={14} className="text-gray-300 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-[#3d2e00] truncate">{b.filename}</p>
                {i === 0 && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Latest</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-gray-300" />
              <span className="text-xs text-gray-500">{b.date}</span>
            </div>
            <span className="text-xs text-gray-400">{b.time}</span>
            <span className="text-xs text-gray-400">{b.size}</span>
            <button
              onClick={() => setConfirmId(b.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#C8A45A] text-white font-semibold rounded-lg hover:bg-[#b8944a] transition-all w-fit"
            >
              <RotateCcw size={12} /> Restore
            </button>
          </div>
        ))}
      </div>

      {/* Confirm restore modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={20} className="text-orange-500" />
            </div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-1 text-center">Confirm Restore</h2>
            <p className="text-sm text-gray-400 text-center mb-2">You are about to restore from:</p>
            <p className="text-xs font-semibold text-center text-[#3d2e00] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-4 break-all">
              {backups.find((b) => b.id === confirmId)?.filename}
            </p>
            <div className="flex items-start gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl mb-5">
              <AlertTriangle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">This will overwrite your current database. This action cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleRestore} className="flex-1 py-2.5 text-sm bg-[#C8A45A] text-white font-semibold rounded-xl hover:bg-[#b8944a]">Yes, Restore</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
