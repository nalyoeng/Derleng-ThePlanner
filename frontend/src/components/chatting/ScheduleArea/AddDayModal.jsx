import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddDayModal({ 
  isOpen, 
  onClose, 
  onAddDay, 
  onUpdateDay, 
  editingDay, 
  groupId // 👈 Passed down perfectly from Chatpage
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  // Auto-fill fields if we are editing an existing day
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
    if (!title.trim() || !date || !groupId) return; 

    if (editingDay) {
      onUpdateDay({ ...editingDay, title, date, group_id: groupId });
    } else {
      onAddDay({ title, date, group_id: groupId });
    }
    
    // Reset form states to prevent ghost data on next open
    setTitle('');
    setDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-gray-100 relative">
        
        {/* Consistent Close Icon */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-['Playfair_Display'] text-2xl font-bold text-gray-900 mb-6">
          {editingDay ? 'Edit Day Details' : 'Add New Trip Day'}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Day Title
            </label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Temple Exploring Tour" 
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-gray-50/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Date
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-gray-50/30"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-11 rounded-xl bg-[#0F5132] hover:bg-[#0B3D25] text-sm font-semibold text-white shadow-sm transition-colors"
            >
              {editingDay ? 'Save Changes' : 'Create Day'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}