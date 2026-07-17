import React from 'react';
import { Users, Plus, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GroupList({ groups, activeGroup, onSelectGroup, onCreateGroupClick }) {
  const navigate = useNavigate();
 
  const getAvatarStyle = (name) => {
    if (!name) return { backgroundColor: '#E5E7EB', color: '#374151' };
    
    const palettes = [
      { bg: '#FEE2E2', text: '#991B1B' }, // Red
      { bg: '#FEF3C7', text: '#92400E' }, // Amber
      { bg: '#D1FAE5', text: '#065F46' }, // Emerald
      { bg: '#DBEAFE', text: '#1E40AF' }, // Blue
      { bg: '#E0E7FF', text: '#3730A3' }, // Indigo
      { bg: '#F3E8FF', text: '#6B21A8' }, // Purple
      { bg: '#FCE7F3', text: '#9D174D' }, // Pink
      { bg: '#E0F2FE', text: '#0369A1' }, // Sky
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % palettes.length;
    return {
      backgroundColor: palettes[index].bg,
      color: palettes[index].text
    };
  };

  const getFirstLetter = (name) => {
    return name ? name.trim().charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3 w-full">
      
      {/* Component Header Block */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <div className="flex items-center gap-2 text-[#0F5132]/90 font-semibold text-xs uppercase tracking-wider">
          <Users className="w-4 h-4 text-[#0F5132]" />
          <span>My Groups</span>
        </div>
        
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onCreateGroupClick}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Create Group</span>
          </button>
          <button 
            type="button" 
            className="px-3 py-1.5 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <Link2 className="w-3 h-3" />
            <span>Join Group</span>
          </button>
        </div>
      </div>

      {/* Cards Mapping Array */}
      <div className="flex flex-col gap-2">
        {groups.length > 0 ? (
          groups.map((group) => {
            const isSelected = activeGroup?.id === group.id;
            const avatarStyle = getAvatarStyle(group.name);
            
            const headcount = group.member_count ?? 1;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  onSelectGroup(group);         
                  navigate(`/chat/${group.id}`);
                }}
                
                className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-between text-left group cursor-pointer ${
                  isSelected
                    ? 'bg-[#F0FDF4] border-[#34D399] shadow-sm'
                    : 'bg-[#F9FAFB] border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  
                  {/* Dynamic Text Avatar */}
                  <div 
                    style={avatarStyle} 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm select-none tracking-wider transition-transform duration-200 group-hover:scale-105"
                  >
                    {getFirstLetter(group.name)}
                  </div>

                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold tracking-wide ${isSelected ? 'text-[#0F5132]' : 'text-[#111827]'}`}>
                      {group.name}
                    </span>
                    <span className="text-[#6B7280] text-xs mt-0.5">
                      {headcount} {headcount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>
                <div className={`text-gray-400 group-hover:text-gray-600 text-sm font-light ${isSelected ? 'text-[#0F5132]' : ''}`}>
                  &gt;
                </div>
              </button>
            );
          })
        ) : (
          <p className="text-center text-xs text-[#6B7280] py-4">No groups found</p>
        )}
      </div>

    </div>
  );
}