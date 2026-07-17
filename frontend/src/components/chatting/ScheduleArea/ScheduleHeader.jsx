import React from 'react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import EditHeaderModal from './EditHeaderModal'; 
import { useNavigate } from 'react-router-dom';

export default function ScheduleHeader({ 
  activeGroup, 
  allProfiles = [],       
  groupMembersTable = [], 
  onUpdateGroupHeader, 
  onBackToChat, 
  onOpenEditModal, 
  isEditModalOpen, 
  onCloseEditModal
}) {

  const navigate = useNavigate();

  // Resolve Travelers 
  const travelers = allProfiles.filter(profile => 
    groupMembersTable.some(member => member.user_id === profile.id && member.group_id === activeGroup?.id)
  );

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    return name
      .trim()
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatCostDisplay = (rawCost) => {
    if (rawCost === null || rawCost === undefined) return '–';
    const costString = rawCost.toString();
    return costString.includes('$') ? costString : `~$${costString}`;
  };

  const displayDates = (!activeGroup?.dates || activeGroup.dates === 'NULL') 
    ? 'Not set' 
    : activeGroup.dates;

  return (
    <div className="w-full bg-[#114B32] text-white rounded-3xl p-6 shadow-sm font-sans relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(`/chat/${groupId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          
          <span>Back to Chat</span>
        </button>

        <button
          type="button"
          onClick={onOpenEditModal}
          className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#34D399] hover:text-white bg-[#0F5132]/40 hover:bg-[#0F5132]/80 border border-transparent hover:border-emerald-500/20 px-3 py-1.5 rounded-lg uppercase cursor-pointer transition-all"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit Details</span>
        </button>
      </div>

      <h1 className="font-['Playfair_Display',_serif] text-2xl md:text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
        {activeGroup?.icon && <span>{activeGroup.icon}</span>}
        <span>{activeGroup?.name || 'Untitled Trip'}</span>
      </h1>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-white/10 text-xs text-white/80">
        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Dates</span>
          <span className="font-semibold text-white">{displayDates}</span>
        </div>

        {/* <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Leader</span>
          <span className="font-semibold text-white">{leaderName}</span>
        </div> */}

        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Est. cost / person</span>
          <span className="font-semibold text-[#34D399]">{formatCostDisplay(activeGroup?.estimate_cost)}</span>
        </div>

        <div>
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
            Travelers ({travelers.length})
          </span>
          <div className="flex items-center -space-x-1.5">
            {travelers.map((profile) => (
              <div 
                key={profile.id} 
                className="w-6 h-6 rounded-full border border-[#114B32] text-[9px] font-bold text-gray-800 bg-emerald-100 flex items-center justify-center shadow-sm select-none"
                title={profile.full_name}
              >
                {getInitials(profile.full_name)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Make sure EditHeaderModal.jsx actually exists in this folder! */}
      <EditHeaderModal 
        isOpen={isEditModalOpen} 
        onClose={onCloseEditModal}
        currentData={{
          name: activeGroup?.name,
          dates: activeGroup?.dates,
          estimate_cost: activeGroup?.estimate_cost,
          leader: activeGroup?.leader
        }}
        onUpdateHeader={onUpdateGroupHeader} 
      />
    </div>
  );
}