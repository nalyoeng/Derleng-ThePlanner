import React from 'react';
import { Link2, Trash2 } from 'lucide-react';

export default function ActivityCard({ activity, onDeleteActivity }) {
  // Color mapping matching your layout style rules
  const typeStyles = {
    Transport: 'bg-blue-50 text-blue-700 border-blue-200',
    Stay: 'bg-amber-50 text-amber-700 border-amber-200',
    Activity: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Food: 'bg-rose-50 text-rose-700 border-rose-200',
    Sight: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] font-sans">
      <div>
        {/* Top Header Card Info */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-900 tracking-wide">{activity.time}</span>
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${typeStyles[activity.type] || 'bg-gray-50 text-gray-600'}`}>
            {activity.type}
          </span>
        </div>

        {/* Core Description Details */}
        <h3 className="text-sm font-bold text-gray-900 mb-1 tracking-wide">
          {activity.title}
        </h3>
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
          <span className="text-rose-500">📍</span> {activity.location}
        </p>
        <p className="text-[11px] leading-relaxed text-gray-500 line-clamp-2">
          {activity.details}
        </p>
      </div>

      {/* Bottom Interactive Row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        {/* Cost Label */}
        <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-[11px] font-bold rounded-lg text-gray-700">
          {activity.cost}
        </span>
        
        {/* Action Buttons Container */}
        <div className="flex items-center gap-1.5">
          {/* STATIC DELETE BUTTON AT THE BOTTOM */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove "${activity.title}"?`)) {
                onDeleteActivity(activity.id);
              }
            }}
            className="w-7 h-7 rounded-lg bg-rose-50/50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100/40 flex items-center justify-center transition-all cursor-pointer"
            title="Delete activity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Link Icon */}
          {activity.link && activity.link !== '#' && (
            <a 
              href={activity.link} 
              target="_blank" 
              rel="noreferrer"
              className="w-7 h-7 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-200 flex items-center justify-center text-gray-400 hover:text-emerald-700 transition-all"
            >
              <Link2 className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}