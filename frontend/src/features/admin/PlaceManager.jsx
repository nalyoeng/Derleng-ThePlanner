import { useState, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, Upload, ImageIcon } from 'lucide-react';

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

const initialDestinations = [
  { id: 1, name: 'Angkor Wat',  categories: ['Heritage', 'Culture'],       location: 'Siem Reap',     rating: 4.9, cost: 37, status: 'Active',  img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=80&h=80&fit=crop' },
  { id: 2, name: 'Kampot',      categories: ['Nature', 'Food & Drink'],    location: 'Southern Coast', rating: 4.7, cost: 20, status: 'Active',  img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=80&h=80&fit=crop' },
  { id: 3, name: 'Koh Rong',    categories: ['Beach', 'Nature'],           location: 'Sihanoukville', rating: 4.8, cost: 25, status: 'Active',  img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=80&h=80&fit=crop' },
  { id: 4, name: 'Phnom Penh',  categories: ['City', 'Food & Drink', 'Nightlife'], location: 'Capital', rating: 4.6, cost: 40, status: 'Active',  img: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=80&h=80&fit=crop' },
  { id: 5, name: 'Battambang',  categories: ['Culture', 'Heritage'],       location: 'Northwest',     rating: 4.5, cost: 25, status: 'Offline', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop' },
];

const emptyForm = { name: '', categories: [], status: 'Active', cost: '', location: '', imageFile: null, imagePreview: '' };
const emptyErrors = { name: '', categories: '', cost: '', location: '', image: '' };

export default function PlaceManager() {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [search, setSearch]             = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [errors, setErrors]             = useState(emptyErrors);
  const [editId, setEditId]             = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const fileInputRef                    = useRef(null);

  const filtered = destinations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.categories.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  // --- Validation ---
  const validate = () => {
    const e = { name: '', categories: '', cost: '', location: '', image: '' };
    let valid = true;

    if (!form.name.trim()) {
      e.name = 'Place name is required.'; valid = false;
    } else if (form.name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters.'; valid = false;
    }

    if (form.categories.length === 0) {
      e.categories = 'Please select at least one category.'; valid = false;
    }

    if (!form.cost) {
      e.cost = 'Estimate cost is required.'; valid = false;
    } else if (isNaN(form.cost) || Number(form.cost) <= 0) {
      e.cost = 'Cost must be a positive number.'; valid = false;
    }

    if (!form.location.trim()) {
      e.location = 'Location is required.'; valid = false;
    }

    if (!form.imagePreview && !editId) {
      e.image = 'Please upload an image.'; valid = false;
    }

    setErrors(e);
    return valid;
  };

  // --- Image handling ---
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'File must be an image (jpg, png, webp, etc.)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be smaller than 5MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm((prev) => ({ ...prev, imageFile: file, imagePreview: e.target.result }));
      setErrors((prev) => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  // --- Category toggle ---
  const toggleCategory = (label) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(label)
        ? prev.categories.filter((c) => c !== label)
        : [...prev.categories, label],
    }));
    setErrors((prev) => ({ ...prev, categories: '' }));
  };

  // --- Open modal ---
  const openAdd = () => {
    setForm(emptyForm); setErrors(emptyErrors); setEditId(null); setShowModal(true);
  };

  const openEdit = (d) => {
    setForm({ name: d.name, categories: [...d.categories], status: d.status, cost: d.cost, location: d.location || '', imageFile: null, imagePreview: d.img });
    setErrors(emptyErrors); setEditId(d.id); setShowModal(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      setDestinations((prev) => prev.map((d) => d.id === editId
        ? { ...d, name: form.name.trim(), categories: form.categories, status: form.status, cost: Number(form.cost), location: form.location.trim(), img: form.imagePreview || d.img }
        : d
      ));
    } else {
      setDestinations((prev) => [...prev, {
        id: Date.now(), name: form.name.trim(), categories: form.categories,
        location: form.location.trim(), rating: 0, cost: Number(form.cost),
        status: form.status, img: form.imagePreview || '',
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    setDestinations((prev) => prev.filter((d) => d.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#C8A45A] italic mb-1">Destination Manager</h1>
      <p className="text-sm text-gray-400 mb-5">Manage all Cambodia travel destinations</p>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search destinations, regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:border-emerald-400"
          />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-all">
          <Plus size={15} /> Add Destination
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {filtered.map((d) => (
          <div key={d.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 hover:bg-orange-50/20 last:border-0 transition-all">
            {d.img
              ? <img src={d.img} alt={d.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
              : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><ImageIcon size={20} className="text-gray-300" /></div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#3d2e00]">{d.name}</p>
              <p className="text-xs text-gray-400">{d.location} · ⭐ {d.rating}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {d.categories.map((c) => (
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
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No destinations found</div>}
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

              {/* Place name */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Place's Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Angkor Wat"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none bg-gray-50 transition-all
                    ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-emerald-400'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Location <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Siem Reap"
                  value={form.location}
                  onChange={(e) => { setForm({ ...form, location: e.target.value }); setErrors({ ...errors, location: '' }); }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none bg-gray-50 transition-all
                    ${errors.location ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-emerald-400'}`}
                />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>

              {/* Categories checkboxes */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  Place Categories <span className="text-red-400">*</span>
                  <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(({ label, emoji }) => {
                    const checked = form.categories.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleCategory(label)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all text-left
                          ${checked
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-medium'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all
                          ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}
                        >
                          {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span>{emoji} {label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.categories && <p className="text-xs text-red-500 mt-1">{errors.categories}</p>}
                {form.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.categories.map((c) => (
                      <span key={c} className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{c}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Status</label>
                <div className="flex gap-2">
                  {['Active', 'Offline'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 text-sm rounded-xl border font-medium transition-all
                        ${form.status === s ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimate cost */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Estimate Cost ($/day) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 37"
                  min="1"
                  value={form.cost}
                  onChange={(e) => { setForm({ ...form, cost: e.target.value }); setErrors({ ...errors, cost: '' }); }}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none bg-gray-50 transition-all
                    ${errors.cost ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-emerald-400'}`}
                />
                {errors.cost && <p className="text-xs text-red-500 mt-1">{errors.cost}</p>}
              </div>

              {/* Image upload */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  Upload Image {!editId && <span className="text-red-400">*</span>}
                </label>

                {/* Preview */}
                {form.imagePreview && (
                  <div className="relative mb-2 w-full h-36 rounded-xl overflow-hidden border border-gray-200">
                    <img src={form.imagePreview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setForm({ ...form, imageFile: null, imagePreview: '' })}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Drop zone */}
                {!form.imagePreview && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                      ${dragOver ? 'border-emerald-400 bg-emerald-50' : errors.image ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/30'}`}
                  >
                    <Upload size={22} className={dragOver ? 'text-emerald-500' : 'text-gray-300'} />
                    <p className="text-xs text-gray-400">
                      <span className="text-emerald-600 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-gray-300">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFile(e.target.files[0])}
                />
                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 text-sm bg-[#C8A45A] text-white font-semibold rounded-xl hover:bg-[#b8944a] transition-all">
                {editId ? 'Save Changes' : 'Add Destination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-[#3d2e00] mb-1">Delete Destination</h2>
            <p className="text-sm text-gray-400 mb-5">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
