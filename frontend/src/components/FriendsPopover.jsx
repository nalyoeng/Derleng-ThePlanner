import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';

export default function FriendsPopover({ isOpen, onClose }) {
  // If the popover state isn't active, don't render it
  if (!isOpen) return null;

  // Mock data representing your Cambodian user matches
  const suggestions = [
    { id: 1, name: 'Dara Keo', initials: 'DK', bgColor: 'bg-[#E05A26]' },
    { id: 2, name: 'Maly Chan', initials: 'MC', bgColor: 'bg-[#2D5A3E]' },
    { id: 3, name: 'Reaksa Heng', initials: 'RH', bgColor: 'bg-[#C59124]' }
  ];

  return (
    <>
      {/* Invisible backdrop layer to close popover when clicking anywhere outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Main Popover Card Box */}
      <div className="absolute right-4 top-16 w-[360px] bg-[#F4F1EC] rounded-3xl p-5 shadow-xl border border-[#E6E1D8] z-50 animate-in fade-in zoom-in-95 duration-100">
        
        {/* Header containing title and absolute close action */}
        <div className="relative flex items-center justify-center mb-4">
          <h3 className="text-black font-semibold text-lg tracking-wide font-sans">
            Friends
          </h3>
          <button 
            onClick={onClose} 
            className="absolute right-0 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Friends Section */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Friends by ID"
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[#EFECE6] border border-[#E3DDD4] text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Suggestions Title Subheading */}
        <div className="mb-3 pl-1">
          <h4 className="text-black font-medium text-sm tracking-wide">
            People You May Know
          </h4>
        </div>

        {/* Suggestion Stack Rows Container */}
        <div className="flex flex-col gap-2.5">
          {suggestions.map((person) => (
            <div
              key={person.id}
              className="w-full h-14 bg-[#EFECE6] border border-[#E3DDD4]/60 rounded-2xl flex items-center justify-between px-4 transition-all hover:bg-[#EAE6DF]"
            >
              {/* Left Side: Avatar block and Identity */}
              <div className="flex items-center gap-3">
                {/* Monogram Circle Badge Component */}
                <div className={`w-9 h-9 rounded-full ${person.bgColor} flex items-center justify-center text-white text-xs font-bold tracking-wider shadow-sm`}>
                  {person.initials}
                </div>
                {/* Username Text String */}
                <span className="text-[#C5A86B] font-medium text-sm tracking-wide font-serif">
                  {person.name}
                </span>
              </div>

              {/* Right Side: Execution Action Control Switch */}
              <button 
                onClick={() => alert(`Friend request sent to ${person.name}`)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-black hover:bg-black/5 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}