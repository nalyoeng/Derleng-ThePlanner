import React, { useState, useEffect } from 'react';

export default function AddDayModal({ isOpen, onClose, onAddDay, onUpdateDay, editingDay }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  // 🌟 IMPORTANT: Sync input form values when switching to Edit Mode
  useEffect(() => {
    if (editingDay) {
      setTitle(editingDay.title || '');
      setDate(editingDay.date || '');
    } else {
      setTitle('');
      setDate('');
    }
  }, [editingDay, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    if (editingDay) {
      // Execute database update callback instruction
      onUpdateDay({ ...editingDay, title, date });
    } else {
      // Execute database creation logic route
      onAddDay({ title, date });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          {editingDay ? 'Edit Day Details' : 'Add New Trip Day'}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Day Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Temple Exploring Tour" 
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              {editingDay ? 'Save Changes' : 'Create Day'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}