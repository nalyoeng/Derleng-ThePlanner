import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Paperclip, BarChart3, Send, Calendar } from 'lucide-react';
import GroupInfoModal from './GroupInfoModal';
import CreatePollModal from './CreatePollModal';

export default function ActiveChat({ 
  activeGroup, 
  messages = [], 
  messageInput, 
  onMessageChange, 
  onSendMessage, 
  onOpenSchedule, 
  onUpdateGroup,
  onCreatePoll, 
  onCastVote,
  currentUserProfile,
  onLeaveGroup,   // 🌟 FIXED: Incoming prop from parent page
  onDeleteGroup,  // 🌟 FIXED: Incoming prop from parent page
  friendsList = [],       // 🌟 Passed through to prevent empty states inside your submodal
  usersList = [],         // 🌟 Passed through
  groupMembersTable = [], // 🌟 Passed through
  onInviteFriend          // 🌟 Passed through
}) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scrolls chat window to the bottom whenever a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🎨 Helper function to generate a consistent, tailored background color based on the group name
  const getAvatarStyle = (name) => {
    if (!name) return { backgroundColor: '#E5E7EB', color: '#374151' };
    
    const palettes = [
      { bg: '#FEE2E2', text: '#991B1B' }, 
      { bg: '#FEF3C7', text: '#92400E' }, 
      { bg: '#D1FAE5', text: '#065F46' }, 
      { bg: '#DBEAFE', text: '#1E40AF' }, 
      { bg: '#E0E7FF', text: '#3730A3' }, 
      { bg: '#F3E8FF', text: '#6B21A8' }, 
      { bg: '#FCE7F3', text: '#9D174D' }, 
      { bg: '#E0F2FE', text: '#0369A1' }, 
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

  // 🔤 Helper function to get the first letter cleanly
  const getFirstLetter = (name) => {
    return name ? name.trim().charAt(0).toUpperCase() : '?';
  };

  const avatarStyle = getAvatarStyle(activeGroup?.name);

  return (
    <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col h-[600px] max-h-[600px] min-h-[600px] overflow-hidden font-sans">
      
      {/* 1. Top Bar Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <button
          type="button"
          onClick={() => setIsInfoOpen(true)}
          className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity p-1 -m-1 rounded-xl focus:outline-none cursor-pointer"
          title="View Group Roster Info"
        >
          <div 
            style={avatarStyle} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm select-none tracking-wider shrink-0"
          >
            {getFirstLetter(activeGroup?.name)}
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#111827]">{activeGroup?.name}</h2>
            <p className="text-xs text-[#34D399] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#34D399] rounded-full animate-pulse" />
              <span>Real-time Sync Active</span>
            </p>
          </div>
        </button>

        <button 
          type="button"
          onClick={onOpenSchedule}
          className="p-2 rounded-xl text-gray-400 hover:text-[#0F5132] hover:bg-[#F0FDF4] border border-transparent hover:border-[#34D399]/20 transition-all shadow-none duration-200 cursor-pointer"
          title="Schedule Event"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* 2. MESSAGES FEED AREA */}
      <div className="flex-1 p-6 bg-gray-50/40 overflow-y-auto flex flex-col gap-4 min-h-0">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-end gap-2 max-w-[85%] ${msg.isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              {!msg.isMe && (
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#0F5132] text-[9px] font-bold flex items-center justify-center shrink-0 shadow-sm select-none">
                  {msg.initials || '?'}
                </div>
              )}
              
              <div className="flex flex-col gap-0.5 max-w-full w-full">
                {!msg.isMe && (
                  <span className="text-[10px] text-gray-400 font-semibold ml-1">{msg.sender}</span>
                )}
                
                {msg.type === 'poll' ? (
                  <div className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm w-[280px] text-gray-800 ${
                    msg.isMe ? 'ml-auto rounded-br-none' : 'rounded-bl-none'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold tracking-wider uppercase mb-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Workspace Group Poll</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 mb-3 leading-snug">{msg.pollData?.question}</h4>
                    
                    <div className="flex flex-col gap-2">
                      {msg.pollData?.options.map((opt) => {
                        const totalVotes = msg.pollData.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
                        const percentage = totalVotes > 0 ? Math.round(((opt.votes?.length || 0) / totalVotes) * 100) : 0;
                        const hasVoted = currentUserProfile && opt.votes?.includes(currentUserProfile.full_name);

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onCastVote?.(msg.id, opt.id)}
                            className={`w-full text-left rounded-xl p-2.5 border text-xs transition-all relative overflow-hidden group/opt cursor-pointer ${
                              hasVoted ? 'border-[#34D399] bg-[#F0FDF4]/40' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                            }`}
                          >
                            <div 
                              className="absolute top-0 left-0 bottom-0 bg-emerald-500/5 transition-all duration-500 ease-out pointer-events-none" 
                              style={{ width: `${percentage}%` }}
                            />

                            <div className="relative z-10 flex flex-col gap-1">
                              <div className="flex justify-between items-center font-semibold text-gray-700">
                                <span className="truncate pr-2">{opt.text}</span>
                                <span className="text-[10px] text-gray-400 font-bold shrink-0">{percentage}%</span>
                              </div>
                              
                              {opt.votes?.length > 0 && (
                                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                  {opt.votes.map((voter, vi) => (
                                    <span key={vi} className="text-[8px] px-1.5 py-0.5 font-bold rounded bg-white border border-gray-100 shadow-2xs text-gray-500 uppercase select-none animate-scaleIn">
                                      {voter}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 py-2.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed break-all whitespace-pre-wrap w-fit max-w-full ${
                    msg.isMe 
                      ? 'bg-[#114B32] text-white rounded-br-none ml-auto' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                    <p>{msg.text}</p>
                  </div>
                )}
                
                <span className={`text-[9px] text-gray-400 px-1 mt-0.5 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="my-auto text-center text-sm text-gray-400 max-w-xs mx-auto animate-fadeIn">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#0F5132]" />
            <p className="font-semibold text-gray-700">No messages here yet</p>
            <p className="text-xs mt-0.5">Type a message below or launch a poll to kick off the conversation layout!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Message Text Input Box Controls Form */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); onSendMessage(); }} 
          className="flex items-center gap-2 bg-[#F9FAFB] border border-gray-200 rounded-xl px-3 py-2"
        >
          <button type="button" className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            type="text"
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={`Message ${activeGroup?.name}...`}
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder-[#6B7280] focus:outline-none"
          />

          <button 
            type="button" 
            onClick={() => setIsPollOpen(true)}
            className="p-1.5 text-[#6B7280] hover:text-[#0F5132] rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Create Voting Poll"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button 
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2 rounded-xl bg-[#0F5132] hover:bg-[#0B3D25] disabled:opacity-30 text-white shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 🌟 FIXED BELOW: Correctly mapping props from parent through to modal instance context */}
      <GroupInfoModal 
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        activeGroup={activeGroup}
        onUpdateGroup={onUpdateGroup}
        onLeaveGroup={onLeaveGroup}
        onDeleteGroup={onDeleteGroup}
        friendsList={friendsList}
        usersList={usersList}
        groupMembersTable={groupMembersTable}
        onInviteFriend={onInviteFriend}
      />

      <CreatePollModal 
        isOpen={isPollOpen}
        onClose={() => setIsPollOpen(false)}
        onCreatePoll={onCreatePoll}
      />

    </div>
  );
}