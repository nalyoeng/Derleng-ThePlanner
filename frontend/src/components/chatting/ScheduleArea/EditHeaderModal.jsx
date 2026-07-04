import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function EditHeaderModal({ isOpen, onClose, currentData, onUpdateHeader }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [planner, setPlanner] = useState('');
  const [cost, setCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever the modal opens with fresh data
  useEffect(() => {
    if (isOpen) {
      setTitle(currentData?.title || '');
      setPlanner(currentData?.planner || '');
      setCost(currentData?.cost || '');

      // Parse dates if they exist in format "YYYY-MM-DD to YYYY-MM-DD"
      if (currentData?.dates && currentData.dates.includes(' to ')) {
        const [start, end] = currentData.dates.split(' to ');
        setStartDate(start || '');
        setEndDate(end || '');
      } else {
        setStartDate('');
        setEndDate('');
      }
    }
  }, [currentData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Combine start and end dates into a single string for your database column
    const formattedDates = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || '';

    try {
      await onUpdateHeader({ 
        title, 
        dates: formattedDates, 
        planner, 
        cost: cost ? parseFloat(cost) : '' 
      });
      onClose();
    } catch (err) {
      console.error("Failed to update trip details:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans animate-fadeIn">
      <div className="bg-[#FBF9F6] rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header Section */}
        <div className="p-5 pb-3 relative text-center border-b border-gray-100 bg-white">
          <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
            Edit Trip Details
          </h2>
          <button 
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
          {/* Trip Title */}
          <div>
            <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 px-1">Trip Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#114B32] transition-all shadow-sm disabled:bg-gray-50"
              required
            />
          </div>

          {/* Calendar Date Range Pickers */}
          <div>
            <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 px-1">Trip Schedule</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSaving}
                className="w-full h-11 px-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#114B32] transition-all shadow-sm disabled:bg-gray-50"
                required
              />
              <input 
                type="date"
                value={endDate}
                min={startDate} // Prevents choosing an end date before the start date
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSaving}
                className="w-full h-11 px-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#114B32] transition-all shadow-sm disabled:bg-gray-50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Leader / Admin */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 px-1">Leader / Admin</label>
              <input 
                type="text"
                placeholder="Name"
                value={planner}
                onChange={(e) => setPlanner(e.target.value)}
                disabled={isSaving}
                className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#114B32] transition-all shadow-sm disabled:bg-gray-50"
                required
              />
            </div>

            {/* Est. Cost (Numbers Only) */}
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 px-1">Est. Cost ($)</label>
              <input 
                type="number"
                min="0"
                step="any"
                placeholder="e.g., 250"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                disabled={isSaving}
                className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#114B32] transition-all shadow-sm disabled:bg-gray-50"
                required
              />
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-sm cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-10 rounded-xl bg-[#114B32] hover:bg-[#0B3D25] text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:bg-gray-400"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}