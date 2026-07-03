import React from 'react';
import { Search } from 'lucide-react';

export default function GroupSearch({ searchQuery, onSearchChange }) {
  return (
    <div className="w-full relative">
      <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
      <input 
        type="text" 
        placeholder="Search group..." 
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-gray-100 text-xs font-medium focus:outline-none focus:border-[#114B32] focus:ring-1 focus:ring-[#114B32] shadow-sm transition-all"
      />
    </div>
  );
}