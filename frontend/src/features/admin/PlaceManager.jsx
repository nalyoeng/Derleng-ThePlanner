import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Upload, ImageIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  fetchAllDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../../lib/adminApi';

const CATEGORIES = [
  { label: 'Heritage',      emoji: '🏛️' },
  { label: 'Beach',         emoji: '🏖️' },
  { label: 'Nature',        emoji: '🌿' },
  { label: 'City',          emoji: '🏙️' },
  { label: 'Culture',       emoji: '🎭' },
  { label: 'Food & Drink',  emoji: '🍜' },
  { label: 'Accommodation', emoji: '🏨' },
  { label: 'Nightlife',     emoji: '🎉' },
];

const emptyForm   = { name: '', categories: [], status: 'Active', cost: '', location: '', imageFile: null, imagePreview: '' };
const emptyErrors = { name: '', categories: '', cost: '', location: '', image: '' };

export default function PlaceManager() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [toast, setToast]               = useState('');
  const [search, setSearch]             = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [errors, setErrors]             = useState(emptyErrors);
  const [editId, setEditId]             = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const fileInputRef                    = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const loadDestinations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAllDestinations();
      setDestinations(data);
    } catch (err) {
      setError('Failed to load destinations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDestinations(); }, []);

  const filtered = destinations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.categories?.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  // Validation
  const validate = () => {
    const e = { name: '', categories: '', cost: '', location: '', image: '' };
    let valid = true;

    if (!form.name.trim()) { e.name = 'Place name is required.'; valid = false; }
    else if (form.name.trim().length < 2) { e.name = 'Name must be at least 2 characters.'; valid = false; }
    if (form.categories.length === 0) { e.categories = 'Please select at least one category.'; valid = false; }
    if (!form.cost) { e.cost = 'Estimate cost is required.'; valid = false; }
    else if (isNaN(form.cost) || Number(form.cost) <= 0) { e.cost = 'Cost must be a positive number.'; valid = false; }
    if (!form.location.trim()) { e.location = 'Location is required.'; valid = false; }
    if (!form.imagePreview && !editId) { e.image = 'Please upload an image.'; valid = false; }

    setErrors(e);
    return valid;
  };

  // Image handling
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrors(p => ({ ...p, image: 'File must be an image.' })); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, image: 'Image must be smaller than 5MB.' })); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setForm(p => ({ ...p, imageFile: file, imagePreview: e.target.result })); setErrors(p => ({ ...p, image: '' })); };
    reader.readAsDataURL(file);
  };

  const toggleCategory = (label) => {
    setForm(p => ({ ...p, categories: p.categories.includes(label) ? p.categories.filter(c => c !== label) : [...p.categories, label] }));
    setErrors(p => ({ ...p, categories: '' }));
  };

  const openAdd  = () => { setForm(emptyForm); setErrors(emptyErrors); setEditId(null); setShowModal(true); };
  const openEdit = (d) => {
    setForm({ name: d.name, categories: [...(d.categories || [])], status: d.status, cost: d.cost, location: d.location || '', imageFile: null, imagePreview: d.image_url || '' });
    setErrors(emptyErrors); setEditId(d.id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = {
        name:       form.name.trim(),
        location:   form.location.trim(),
        categories: form.categories,
        status:     form.status,
        cost:       Number(form.cost),
        image_url:  form.imagePreview || null,
      };

      if (editId) {
        await updateDestination(editId, payload);
        showToast('✅ Destination updated successfully!');
      } else {
        await createDestination(payload);
        showToast('✅ Destination added successfully!');
      }
      await loadDestinations();
      setShowModal(false);
    } catch (err) {
      setErrors(p => ({ ...p, name: err.response?.data?.error || 'Failed to save. Try again.' }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDestination(deleteId);
      showToast('🗑️ Destination deleted.');
      await loadDestinations();
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete destination.');
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-[#C8A45A] italic">Destination Manager</h1>
        <button onClick={loadDestinations} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-5">Manage all Cambodia travel destinations</p>

      {toast && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search destinations..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:border-emerald-400" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-all">
          <Plus size={15} /> Add Destination
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading && (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#C8A45A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Loading destinations...</p>
          </div>
        )}
        {!loading && filtered.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No destinations found</div>}
        {!loading && filtered.map((d) => (
          <div key={d.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 hover:bg-orange-50/20 last:border-0 transition-all">
            {d.image_url
              ? <img src={d.image_url} alt={d.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
              : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><ImageIcon size={20} className="text-gray-300" /></div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3d2e00]">{d.name}</p>
              <p className="text-xs text-gray-400">{d.location} · ⭐ {d.rating || 0}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {d.categories?.map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">{c}</span>
                ))}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${d.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                  {d.status}
                </span>
              </div>
            </div>
            <div className="text-sm font-semibold text-emerald-600 mr-4">${d.cost}/day</div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(d)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-all">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => setDeleteId(d.id)} className="p-1.5 border border-red-100 rounded-lg text-red-400 hover:bg-red-50 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#3d2e00]">{editId ? 'Edit Destination' : 'Add Destination'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-4 flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Place's Name <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. Angkor Wat" value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none bg-gray-50 ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-emerald-400'}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              {/* Location */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Location <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. Siem Reap" value={form.location}
                  onChange={(e) => { setForm({ ...form, location: e.target.value }); setErrors({ ...errors, location: '' }); }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none bg-gray-50 ${errors.location ? 'border-red-400' : 'border-gray-200 focus:border-emerald-400'}`} />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>
              {/* Categories */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Categories <span className="text-red-400">*</span> <span className="text-gray-400 font-normal">(select all that apply)</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(({ label, emoji }) => {
                    const checked = form.categories.includes(label);
                    return (
                      <button key={label} type="button" onClick={() => toggleCategory(label)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all text-left ${checked ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        <span className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                          {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        {emoji} {label}
                      </button>
                    );
                  })}
                </div>
                {errors.categories && <p className="text-xs text-red-500 mt-1">{errors.categories}</p>}
              </div>
              {/* Status */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Status</label>
                <div className="flex gap-2">
                  {['Active', 'Offline'].map((s) => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 text-sm rounded-xl border font-medium transition-all ${form.status === s ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {/* Cost */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Estimate Cost ($/day) <span className="text-red-400">*</span></label>
                <input type="number" placeholder="e.g. 37" min="1" value={form.cost}
                  onChange={(e) => { setForm({ ...form, cost: e.target.value }); setErrors({ ...errors, cost: '' }); }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none bg-gray-50 ${errors.cost ? 'border-red-400' : 'border-gray-200 focus:border-emerald-400'}`} />
                {errors.cost && <p className="text-xs text-red-500 mt-1">{errors.cost}</p>}
              </div>
              {/* Image */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Upload Image {!editId && <span className="text-red-400">*</span>}</label>
                {form.imagePreview && (
                  <div className="relative mb-2 w-full h-36 rounded-xl overflow-hidden border border-gray-200">
                    <img src={form.imagePreview} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => setForm({ ...form, imageFile: null, imagePreview: '' })}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"><X size={12} /></button>
                  </div>
                )}
                {!form.imagePreview && (
                  <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${dragOver ? 'border-emerald-400 bg-emerald-50' : errors.image ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-300'}`}>
                    <Upload size={22} className="text-gray-300" />
                    <p className="text-xs text-gray-400"><span className="text-emerald-600 font-medium">Click to upload</span> or drag and drop</p>
                    <p className="text-[10px] text-gray-300">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files[0])} />
                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 text-sm bg-[#C8A45A] text-white font-semibold rounded-xl hover:bg-[#b8944a] transition-all disabled:opacity-60">
                {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Destination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500" /></div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-1">Delete Destination</h2>
            <p className="text-sm text-gray-400 mb-5">Are you sure? This action cannot be undone.</p>
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
