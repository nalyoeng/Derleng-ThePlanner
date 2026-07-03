import React from 'react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import EditHeaderModal from './EditHeaderModal'; 

export default function ScheduleHeader({ activeGroup, onUpdateGroupHeader, onBackToChat }) {
  const [isHeaderModalOpen, setIsHeaderModalOpen] = React.useState(false);

  // 🌟 Extract initials dynamically from your database row members array
  const getTravelersList = () => {
    // Check if activeGroup.members exists and is an array
    if (activeGroup?.members && Array.isArray(activeGroup.members)) {
      return activeGroup.members.map(member => {
        // If members are objects like { name: "Sok Vy" }, get initials
        if (typeof member === 'object' && member?.name) {
          return member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        }
        // If members are strings like "Sok Vy", get initials
        if (typeof member === 'string') {
          return member.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        }
        return '??';
      });
    }
    
    // Fallback if no members array exists yet in this group row
    return ['ME'];
  };

  const travelersList = getTravelersList();

  const formatCostDisplay = (rawCost) => {
    if (!rawCost) return '–';
    return rawCost.toString().includes('$') ? rawCost : `~$${rawCost}`;
  };

  return (
    <div className="w-full bg-[#114B32] text-white rounded-3xl p-6 shadow-sm font-sans relative overflow-hidden">
      
      {/* Top action row */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBackToChat}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setIsHeaderModalOpen(true)}
          className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#34D399] hover:text-white bg-[#0F5132]/40 hover:bg-[#0F5132]/80 border border-transparent hover:border-emerald-500/20 px-3 py-1.5 rounded-lg uppercase cursor-pointer transition-all"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Main Banner Title */}
      <h1 className="font-['Playfair_Display',_serif] text-2xl md:text-3xl font-bold tracking-tight mb-6">
        {activeGroup?.name || 'Untitled Trip'}
      </h1>

      {/* Info Metadata Badges */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-white/10 text-xs text-white/80">
        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Dates</span>
          <span className="font-semibold text-white">{activeGroup?.dates || 'Not set'}</span>
        </div>

        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Leader / Admin</span>
          <span className="font-semibold text-white">{activeGroup?.planner || 'Not set'}</span>
        </div>

        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Est. cost / person</span>
          <span className="font-semibold text-[#34D399]">{formatCostDisplay(activeGroup?.cost)}</span>
        </div>

        {/* 🌟 Dynamic Travelers List Component */}
        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Travelers ({travelersList.length})</span>
          <div className="flex items-center -space-x-1.5">
            {travelersList.map((initials, index) => (
              <div 
                key={index} 
                className="w-6 h-6 rounded-full border border-[#114B32] text-[9px] font-bold text-gray-800 bg-emerald-100 flex items-center justify-center shadow-sm select-none"
                title={activeGroup?.members?.[index]?.name || activeGroup?.members?.[index] || 'Traveler'}
              >
                {initials}
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditHeaderModal 
        isOpen={isHeaderModalOpen}
        onClose={() => setIsHeaderModalOpen(false)}
        currentData={{
          title: activeGroup?.name,
          dates: activeGroup?.dates,
          planner: activeGroup?.planner,
          cost: activeGroup?.cost
        }}
        onUpdateHeader={onUpdateGroupHeader} 
      />

    </div>
  );
}