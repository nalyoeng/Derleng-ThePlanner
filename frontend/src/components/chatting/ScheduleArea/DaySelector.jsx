import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function DaySelector({ 
  days, 
  activeDay, 
  onSelectDay, 
  onOpenModal, 
  onOpenEditModal, 
  onDeleteDay      
}) {
  
  // 🌟 NEW: Sort the days array chronologically by comparing their date strings
  const chronologicallySortedDays = [...days].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-2 font-sans scrollbar-none">
      
      {/* 🌟 NEW: Map over the sorted array instead of the raw database array */}
      {chronologicallySortedDays.map((day, index) => {
        const isActive = activeDay === day.id;
        
        return (
          <div 
            key={day.id} 
            className={`relative group px-5 py-3 rounded-2xl border text-left min-w-[150px] transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
            onClick={() => onSelectDay(day.id)}
          >
            <div className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pl-1 rounded-bl ${
              isActive ? 'bg-emerald-50' : 'bg-white'
            }`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); 
                  if (onOpenEditModal) onOpenEditModal(day);
                }}
                className="p-1 text-gray-400 hover:text-emerald-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); 
                  if (onDeleteDay) onDeleteDay(day.id);
                }}
                className="p-1 text-gray-400 hover:text-rose-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <span className={`block text-[11px] uppercase tracking-wider font-bold ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
              {/* Because the array is sorted by date, index + 1 is guaranteed to be chronologically accurate */}
              Day {index + 1}
            </span>
            <span className="block text-sm font-bold text-gray-900 mt-0.5 pr-8 truncate">{day.title}</span>
            <span className="block text-[10px] text-gray-400 mt-0.5">{day.date}</span>
          </div>
        );
      })}

      {/* ADD DAY BUTTON */}
      <button 
        type="button"
        onClick={() => {
          if (onOpenModal) onOpenModal();
        }}
        className="h-14 px-4 rounded-2xl border border-dashed border-gray-200 hover:border-emerald-400 text-gray-400 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors bg-white/50 cursor-pointer shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Day</span>
      </button>
    </div>
  );
}