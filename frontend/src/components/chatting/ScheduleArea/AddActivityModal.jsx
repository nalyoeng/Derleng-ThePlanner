import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddActivityModal({ 
  isOpen, 
  onClose, 
  onAddActivity, 
  currentDayTitle, 
  dayId,   // 👈 Link to day
  groupId  // 👈 Link to group
}) {
  const [category, setCategory] = useState('Activity');
  const [title, setTitle] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('PM');
  const [costAmount, setCostAmount] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');

  // Add these missing arrays so your dropdowns work
  const categories = ['Activity', 'Dining', 'Transit', 'Lodging', 'Sightseeing'];
  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = ['00', '15', '30', '45'];

  if (!isOpen) return null;

  // Handler to force numeric-only input for the cost field
  const handleCostChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCostAmount(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !dayId || !groupId) return;

    const formattedTimeString = `${hour}:${minute} ${ampm}`;
    const cleanCostString = costAmount ? `$${costAmount}` : 'Free';

    // 🌟 Perfect match for your Supabase schema
    onAddActivity({
      day_id: dayId,      
      group_id: groupId,  
      type: category,
      title,
      time: formattedTimeString,
      cost: cleanCostString,
      location: location.trim() || 'Not Specified',
      details: notes,
      link: link.trim() || '#'
    });

    // Reset form for next time
    setTitle('');
    setCostAmount('');
    setLocation('');
    setNotes('');
    setLink('');
    setCategory('Activity');
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh] border border-gray-100 scrollbar-none">
        
        {/* Header Block */}
        <div className="p-6 pb-4 border-b border-gray-100 relative bg-white sticky top-0 z-10">
          <span className="block text-xs font-bold uppercase tracking-wider text-emerald-600/70 mb-1">
            {currentDayTitle || 'Add Activity'}
          </span>
          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-gray-900">
            Add an activity
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form Area */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Category Pill Selectors */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    category === cat
                      ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Title
            </label>
            <input 
              type="text" 
              placeholder="e.g. Sunset boat ride"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-gray-50/30"
              required
            />
          </div>

          {/* Time & Cost Structured Grid Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Structured Time Selectors */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Time
              </label>
              <div className="flex items-center gap-1 bg-gray-50/50 border border-gray-200 rounded-xl p-1 h-11">
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-gray-800 focus:outline-none text-center cursor-pointer appearance-none"
                >
                  {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-gray-400 font-bold self-center">:</span>
                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-gray-800 focus:outline-none text-center cursor-pointer appearance-none"
                >
                  {minutesList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                  value={ampm}
                  onChange={(e) => setAmpm(e.target.value)}
                  className="flex-1 bg-gray-900 text-white text-xs font-bold rounded-lg h-full px-1 focus:outline-none text-center cursor-pointer"
                >
                  <option value="AM" className="bg-white text-gray-900">AM</option>
                  <option value="PM" className="bg-white text-gray-900">PM</option>
                </select>
              </div>
            </div>

            {/* Numeric Only Cost with Fixed Currency Decorator */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Est. cost / person
              </label>
              <div className="relative flex items-center w-full h-11 rounded-xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all bg-gray-50/30 overflow-hidden">
                <span className="absolute left-4 text-sm font-bold text-gray-500 select-none">
                  $
                </span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0 (Leave empty for Free)"
                  value={costAmount}
                  onChange={handleCostChange}
                  className="w-full h-full pl-8 pr-4 bg-transparent text-sm text-gray-800 focus:outline-none font-medium"
                />
              </div>
            </div>

          </div>

          {/* Location Input Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Location
            </label>
            <input 
              type="text" 
              placeholder="e.g. Kampot River, near old bridge"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-gray-50/30"
            />
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea 
              placeholder="Tips, booking info, what to bring..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-gray-50/30 resize-none"
            />
          </div>

          {/* Link Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Link URL Reference
            </label>
            <textarea 
              placeholder="Paste website links, maps pins or reservation URLs"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              rows={2}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-gray-50/30 resize-none"
            />
          </div>

          {/* Form Actions */}
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
              className="px-5 h-11 rounded-xl bg-[#C2593F] hover:bg-[#A94832] text-sm font-semibold text-white shadow-sm transition-colors"
            >
              Add activity
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}