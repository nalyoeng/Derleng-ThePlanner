import { useState, useEffect } from 'react';
import { Database, Download, RotateCcw, Plus, AlertTriangle, CheckCircle2, Clock, HardDrive, Trash2 } from 'lucide-react';
import { fetchBackups, createBackup, restoreBackup } from '../../lib/adminApi';

// ─── BACKUP PAGE ───────────────────────────────────────────────
export function Backup() {
  const [backups, setBackups]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [backing, setBacking]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast]       = useState('');
  const [error, setError]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const loadBackups = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchBackups();
      setBackups(data);
    } catch (err) {
      setError('Failed to load backups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBackups(); }, []);

  const handleBackup = async () => {
    try {
      setBacking(true);
      setError('');
      const result = await createBackup();
      showToast(`✅ Backup created: ${result.filename}`);
      await loadBackups();
    } catch (err) {
      setError('Failed to create backup. Please try again.');
    } finally {
      setBacking(false);
    }
  };

  const handleDownload = (backup) => {
    // Create a download link pointing to backend
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/admin/backups/download/${backup.filename}`;
    link.download = backup.filename;
    link.click();
    showToast(`📥 Downloading ${backup.filename}`);
  };

  const handleDelete = () => {
    setBackups((prev) => prev.filter((b) => b.filename !== deleteId));
    setDeleteId(null);
    showToast('🗑️ Backup file removed from list.');
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#C8A45A] italic mb-1">Backup</h1>
      <p className="text-sm text-gray-400 mb-5">Create and manage database backup files</p>

      {toast && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

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
          This will export the current state of your database into a <strong>.json</strong> file and save it to the backup list below.
        </p>
        <button
          onClick={handleBackup}
          disabled={backing}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C8A45A] text-white text-sm font-semibold rounded-xl hover:bg-[#b8944a] transition-all disabled:opacity-60"
        >
          {backing ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Backing up...</>
          ) : (
            <><Plus size={16} /> Backup Now</>
          )}
        </button>
      </div>

      {/* Backup list */}
      <h2 className="text-sm font-semibold text-[#3d2e00] mb-3">Backup History</h2>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1.2fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
          {['File Name', 'Date', 'Time', 'Size', 'Actions'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading && (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#C8A45A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Loading backups...</p>
          </div>
        )}

        {!loading && backups.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No backups yet. Create your first backup above.</div>
        )}

        {!loading && backups.map((b) => (
          <div key={b.filename} className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1.2fr] px-5 py-3.5 border-b border-gray-50 last:border-0 items-center hover:bg-orange-50/20 transition-all">
            <div className="flex items-center gap-2">
              <HardDrive size={14} className="text-gray-300 flex-shrink-0" />
              <span className="text-xs font-medium text-[#3d2e00] truncate">{b.filename}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-gray-300" />
              <span className="text-xs text-gray-500">{b.date}</span>
            </div>
            <span className="text-xs text-gray-400">{b.time}</span>
            <span className="text-xs text-gray-400">{b.size}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(b)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-all"
              >
                <Download size={12} /> Download
              </button>
              <button
                onClick={() => setDeleteId(b.filename)}
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
            <p className="text-sm text-gray-400 mb-5">This backup file will be permanently deleted.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECOVER PAGE ──────────────────────────────────────────────
export function Recover() {
  const [backups, setBackups]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [restoring, setRestoring]     = useState(false);
  const [confirmFile, setConfirmFile] = useState(null);
  const [toast, setToast]             = useState('');
  const [error, setError]             = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await fetchBackups();
      setBackups(data);
    } catch (err) {
      setError('Failed to load backup files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBackups(); }, []);

  const handleRestore = async () => {
    try {
      setRestoring(true);
      setConfirmFile(null);
      await restoreBackup(confirmFile);
      showToast(`✅ Database restored from "${confirmFile}" successfully!`);
    } catch (err) {
      setError('Failed to restore database. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#C8A45A] italic mb-1">Recover</h1>
      <p className="text-sm text-gray-400 mb-5">Restore your database from a previous backup file</p>

      {toast && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

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
        <div className="flex items-start gap-6">
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

      {/* Backup list */}
      <h2 className="text-sm font-semibold text-[#3d2e00] mb-3">Available Backup Files</h2>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1fr] px-5 py-3 bg-[#faf8f3] border-b border-gray-100">
          {['File Name', 'Date', 'Time', 'Size', 'Action'].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading && (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#C8A45A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Loading backup files...</p>
          </div>
        )}

        {!loading && backups.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No backup files found. Go to Backup page to create one first.
          </div>
        )}

        {!loading && backups.map((b, i) => (
          <div key={b.filename} className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1fr] px-5 py-3.5 border-b border-gray-50 last:border-0 items-center hover:bg-orange-50/20 transition-all">
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
              onClick={() => setConfirmFile(b.filename)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#C8A45A] text-white font-semibold rounded-lg hover:bg-[#b8944a] transition-all w-fit"
            >
              <RotateCcw size={12} /> Restore
            </button>
          </div>
        ))}
      </div>

      {/* Confirm restore modal */}
      {confirmFile && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={20} className="text-orange-500" />
            </div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-1 text-center">Confirm Restore</h2>
            <p className="text-sm text-gray-400 text-center mb-2">You are about to restore from:</p>
            <p className="text-xs font-semibold text-center text-[#3d2e00] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-4 break-all">
              {confirmFile}
            </p>
            <div className="flex items-start gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl mb-5">
              <AlertTriangle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">This will overwrite your current database. This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmFile(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500">Cancel</button>
              <button onClick={handleRestore} className="flex-1 py-2.5 text-sm bg-[#C8A45A] text-white font-semibold rounded-xl hover:bg-[#b8944a]">Yes, Restore</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
