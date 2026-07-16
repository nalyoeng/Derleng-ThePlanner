import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, LogOut, ShieldCheck, Calendar, FolderOpen, Edit2, Check } from 'lucide-react';

export default function GroupInfoModal({ 
  isOpen, 
  onClose, 
  activeGroup, 
  onUpdateGroup,
  friendsList = [],       
  usersList = [],         
  groupMembersTable = [], 
  onInviteFriend,
  onLeaveGroup,   // 🌟 Added destructured prop
  onDeleteGroup   // 🌟 Added destructured prop
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedIcon, setEditedIcon] = useState('💬');
  const [showInviteView, setShowInviteView] = useState(false); 

  useEffect(() => {
    if (activeGroup) {
      setEditedName(activeGroup.name || '');
      setEditedIcon(activeGroup.icon || '💬');
    }
    setIsEditing(false); 
    setShowInviteView(false); 
  }, [activeGroup, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!editedName.trim()) return;
    onUpdateGroup({
      title: editedName, 
      icon: editedIcon
    });
    setIsEditing(false);
  };

  // Helper function to handle initials on the fly safely
  const makeInitials = (name) => {
    if (!name) return '??';
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter out members matching this specific group workspace
  const currentGroupAllocations = groupMembersTable.filter(
    (row) => String(row.group_id) === String(activeGroup?.id)
  );

  // Map database entries to readable profile parameters
  const realGroupMembers = currentGroupAllocations.map((allocation) => {
    const userProfile = usersList.find((u) => String(u.id) === String(allocation.user_id));
    return {
      id: allocation.id, 
      userId: allocation.user_id,
      name: userProfile?.name || 'Classmate',
      initials: userProfile?.initials || makeInitials(userProfile?.name) || 'CM',
      avatarBg: userProfile?.avatarBg || 'bg-gray-100 text-gray-600',
      role: allocation.role || 'Member'
    };
  });

  // Identify friends who haven't joined yet using string normalization
  const nonMemberFriends = friendsList.filter(
    (friend) => !realGroupMembers.some((member) => String(member.userId) === String(friend.id))
  );

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans">
      <div className="bg-[#FBF9F6] rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header Block */}
        <div className="p-5 pb-4 relative text-center border-b border-gray-100 bg-white">
          <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
            {showInviteView ? "Invite Friends" : "Group Details"}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Content Container */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          
          {/* VIEW 1: SELECT FRIENDS LIST FOR ACTIVE INVITATION */}
          {showInviteView ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Available Friends ({nonMemberFriends.length})
                </span>
                <button 
                  onClick={() => setShowInviteView(false)}
                  className="text-[10px] font-bold text-[#0F5132] hover:underline animate-pulse"
                >
                  View Directory
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-2.5 flex flex-col gap-1 shadow-sm max-h-60 overflow-y-auto">
                {nonMemberFriends.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6 font-medium">
                    All your available friends are already in this group!
                  </p>
                ) : (
                  nonMemberFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full text-[10px] font-bold ${friend.avatarBg || 'bg-emerald-100 text-emerald-800'} flex items-center justify-center shadow-inner`}>
                          {friend.initials || makeInitials(friend.name)}
                        </div>
                        <span className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{friend.name}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (onInviteFriend) onInviteFriend(friend.id, activeGroup.id);
                        }}
                        className="text-[10px] font-bold text-white bg-[#0F5132] hover:bg-[#0B3D25] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowInviteView(false)}
                className="w-full h-10 mt-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
              >
                Back to Details
              </button>
            </div>
          ) : (
            
            /* VIEW 2: STANDARD ROSTER AND ANALYTICS CONTROLS */
            <>
              {/* Profile Card Block */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm relative group/card">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-[#0F5132] p-1.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                      title="Edit name and image"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#34D399]/20 flex items-center justify-center text-3xl shadow-sm mb-3">
                      {activeGroup?.icon || '💬'}
                    </div>
                    <h3 className="text-base font-bold text-[#111827]">{activeGroup?.name}</h3>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center text-2xl shadow-sm relative transition-all">
                      <span>{editedIcon}</span>
                    </div>

                    <div className="w-full flex gap-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="flex-1 h-9 px-3 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#114B32] text-center"
                        placeholder="Group Name"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSave}
                        className="h-9 w-9 bg-[#114B32] hover:bg-[#0B3D25] text-white flex items-center justify-center rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  Created • {activeGroup?.created_at ? new Date(activeGroup.created_at).toLocaleDateString() : 'Recent'}
                </p>
              </div>

              {/* Core Analytics Quick View */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
                  <Calendar className="w-4 h-4 text-[#0F5132]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Trip</span>
                    <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                      {activeGroup?.dates || 'Flexible Dates'}
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
                  <FolderOpen className="w-4 h-4 text-[#0F5132]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated Budget</span>
                    <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                      {activeGroup?.cost || 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Group Roster Members List Section */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">
                  Roster Directory ({realGroupMembers.length})
                </span>
                <div className="bg-white border border-gray-100 rounded-2xl p-2.5 flex flex-col gap-1 shadow-sm max-h-52 overflow-y-auto">
                  {realGroupMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full text-[10px] font-bold ${member.avatarBg} flex items-center justify-center shadow-inner`}>
                          {member.initials}
                        </div>
                        <span className="text-xs font-semibold text-gray-700 truncate max-w-[180px]">{member.name}</span>
                      </div>
                      
                      {member.role === 'Leader' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#0F5132] bg-[#F0FDF4] px-2 py-1 border border-emerald-100 rounded-md">
                          <ShieldCheck className="w-3 h-3" />
                          Leader
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400 px-2 py-1">
                          Member
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Administrative Actions */}
              <div className="flex flex-col gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteView(true)} 
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-gray-500" />
                  <span>Invite New Member</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to leave this group workspace?')) {
                      if (onLeaveGroup) onLeaveGroup();
                    }
                  }}
                  className="w-full h-10 px-4 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Group Workspace</span>
                </button>

                {activeGroup?.role === 'Leader' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('CRITICAL: Delete this workspace permanently for everyone?')) {
                        if (onDeleteGroup) onDeleteGroup();
                      }
                    }}
                    className="w-full h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <span>Delete Workspace</span>
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}