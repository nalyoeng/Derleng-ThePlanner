import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import GroupSearch from './sidebar/GroupSearch';
import GroupList from './sidebar/GroupList';
import EmptyState from './chatArea/EmptyState';
import ActiveChat from './chatArea/ActiveChat';
import ScheduleHeader from './scheduleArea/ScheduleHeader';
import DaySelector from './scheduleArea/DaySelector';
import ActivityCard from './scheduleArea/ActivityCard';
import AddDayModal from './scheduleArea/AddDayModal';
import AddActivityModal from './scheduleArea/AddActivityModal';
import CreateGroupModal from './sidebar/CreateGroupModal';
import { supabase } from '../../supabaseClient.js';

export default function Chatpage() {
  const [activeGroup, setActiveGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  
  const [viewMode, setViewMode] = useState('chat');
  const [activeDay, setActiveDay] = useState(null); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const [scheduleDays, setScheduleDays] = useState([]);
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [currentEditingDay, setCurrentEditingDay] = useState(null); 
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const activeGroupMessages = messages.filter(msg => 
    String(msg.groupId) === String(activeGroup?.id)
  );

  const handleBackToChat = () => {
    setViewMode('chat');
  };

  // --- 1. FETCH PROFILE ON MOUNT ---
  useEffect(() => {
    const getLoggedInUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, initials')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setCurrentUserProfile(profile);
        }
      }
    };
    getLoggedInUser();
  }, []);

  // --- 2. FETCH GROUPS ON MOUNT (FIXED INIFINITE LOOP BY REMOVING activeGroup DEPENDENCY) ---
  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) {
        setGroups(data);
        if (data.length > 0 && !activeGroup) {
          setActiveGroup(data[0]);
        }
      } else if (error) {
        console.error("Error loading workspace groups:", error);
      }
    };

    fetchGroups();
  }, []); // 👈 Kept empty so it only executes once on app load

  // --- 3. FETCH MESSAGES DATA ON GROUP OR PROFILE READY ---
  useEffect(() => {
    if (!activeGroup?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          poll_options ( id, option_text, votes )
        `)
        .eq('group_id', activeGroup.id)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        const formattedMessages = data.map(msg => ({
          id: msg.id,
          groupId: msg.group_id,
          text: msg.text,
          sender: msg.sender,
          initials: msg.initials,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: String(msg.sender).trim().toLowerCase() === 'you' || 
      (currentUserProfile && String(msg.sender).trim() === String(currentUserProfile.full_name).trim()),
          type: msg.type,
          pollData: msg.type === 'poll' ? {
            question: msg.text,
            options: msg.poll_options.map(opt => ({
              id: opt.id,
              text: opt.option_text,
              votes: opt.votes || []
            }))
          } : null
        }));
        setMessages(formattedMessages);
      }
    };

    fetchMessages();
  }, [activeGroup?.id, currentUserProfile]); // Added profile tracking to evaluate alignment cleanly

  // --- 4. LIVE REAL-TIME POSTGRES SYNC CHANNEL ---
  useEffect(() => {
    if (!activeGroup?.id) return;

    const channelName = `room-${activeGroup.id}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `group_id=eq.${activeGroup.id}`
        }, 
        async (payload) => {
          if (payload.new.type === 'poll') {
            const { data } = await supabase
              .from('messages')
              .select('*, poll_options(*)')
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              const freshPoll = {
                id: data.id,
                groupId: data.group_id,
                text: data.text,
                sender: data.sender,
                initials: data.initials,
                time: 'Just now',
                isMe: String(payload.new.sender).trim().toLowerCase() === 'you' || 
      (currentUserProfile && String(payload.new.sender).trim() === String(currentUserProfile.full_name).trim()),
                type: 'poll',
                pollData: {
                  question: data.text,
                  options: data.poll_options.map(o => ({ id: o.id, text: o.option_text, votes: o.votes || [] }))
                }
              };
              setMessages(prev => [...prev.filter(m => m.id !== freshPoll.id), freshPoll]);
            }
          } else {
            const freshMsg = {
              id: payload.new.id,
              groupId: payload.new.group_id,
              text: payload.new.text,
              sender: payload.new.sender,
              initials: payload.new.initials,
              time: 'Just now',
              // 🌟 FIXED REAL-TIME STREAM LAYOUT COLOR:
              isMe: currentUserProfile ? String(payload.new.sender).trim() === String(currentUserProfile.full_name).trim() : false,
              type: 'text'
            };

            setMessages(prev => {
              if (prev.some(m => m.id === freshMsg.id)) return prev;
              return [...prev, freshMsg];
            });
          }
        }
      )
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'poll_options' }, 
        (payload) => {
          setMessages(prev => prev.map(msg => {
            if (msg.type !== 'poll') return msg;
            const updatedOptions = msg.pollData.options.map(opt => {
              if (opt.id === payload.new.id) {
                return { ...opt, votes: payload.new.votes || [] };
              }
              return opt;
            });
            return { ...msg, pollData: { ...msg.pollData, options: updatedOptions } };
          }));
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeGroup?.id, currentUserProfile]);

  // --- 5. ITINERARY DAYS SYNCHRONIZER ---
  useEffect(() => {
    if (!activeGroup?.id || viewMode !== 'schedule') return;

    const loadItineraryDays = async () => {
      try {
        const { data, error } = await supabase
          .from('days')
          .select('*')
          .eq('group_id', activeGroup.id)
          .order('id', { ascending: true });

        if (error) throw error;

        setScheduleDays(data || []);
        if (data && data.length > 0) {
          setActiveDay(data[0].id); 
        } else {
          setActiveDay(null);
        }
      } catch (err) {
        console.error("Failed loading trip days via Supabase:", err.message);
      }
    };

    loadItineraryDays();
  }, [activeGroup?.id, viewMode]);

  // --- 6. ACTIVITIES CARD SYNCHRONIZER ---
  useEffect(() => {
    if (!activeDay || viewMode !== 'schedule') return;

    const loadActivitiesByDay = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('day_id', activeDay)
          .order('time', { ascending: true });

        if (error) throw error;

        const formattedActivities = (data || []).map(act => ({
          id: act.id,
          dayId: act.day_id,
          time: act.time,
          type: act.type,
          title: act.title,
          location: act.location,
          details: act.details,
          cost: act.cost,
          link: act.link
        }));

        setActivities(formattedActivities);
      } catch (err) {
        console.error("Failed loading activities via Supabase:", err.message);
      }
    };

    loadActivitiesByDay();
  }, [activeDay, viewMode]);

  // --- 7. CHAT SUBMISSION ACTIONS ---
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeGroup?.id) return;

    const currentText = messageInput;
    setMessageInput('');

    // Fallback gracefully if profile fails to load so sending never breaks
    const senderName = currentUserProfile?.full_name || 'You';
    const senderInitials = currentUserProfile?.initials || 'ME';

    const { error } = await supabase
      .from('messages')
      .insert([
        { 
          group_id: activeGroup.id, 
          text: currentText, 
          sender: senderName, 
          initials: senderInitials, 
          type: 'text' 
        }
      ]);

    if (error) {
      console.error("Failed to sync message to backend:", error);
      setMessageInput(currentText);
    }
  };

  // --- 8. POLL GENERATION SUBMISSION ---
  const handleCreatePoll = async (question, pollOptions) => {
    if (!activeGroup?.id || !currentUserProfile) return;

    const { data: messageHead, error: headError } = await supabase
      .from('messages')
      .insert([
        {
          group_id: activeGroup.id,
          text: question,
          sender: currentUserProfile.full_name,
          initials: currentUserProfile.initials,
          type: 'poll'
        }
      ])
      .select()
      .single();

    if (headError || !messageHead) return;

    const optionsPayload = pollOptions.map(opt => ({
      message_id: messageHead.id,
      option_text: opt,
      votes: []
    }));

    await supabase.from('poll_options').insert(optionsPayload);
  };

  // --- 9. POLL VOTING TRANSACTIONS ---
  const handleCastVote = async (messageId, optionId) => {
    const targetMsg = messages.find(m => m.id === messageId);
    if (!targetMsg || targetMsg.type !== 'poll' || !currentUserProfile) return;

    const userSignature = currentUserProfile.full_name;

    for (const opt of targetMsg.pollData.options) {
      let activeVotesArray = opt.votes || [];
      const hasSignature = activeVotesArray.includes(userSignature);

      if (opt.id === optionId) {
        activeVotesArray = hasSignature 
          ? activeVotesArray.filter(v => v !== userSignature) 
          : [...activeVotesArray, userSignature];
      } else {
        activeVotesArray = activeVotesArray.filter(v => v !== userSignature);
      }

      await supabase
        .from('poll_options')
        .update({ votes: activeVotesArray })
        .eq('id', opt.id);
    }
  };

  const handleAddDaySubmit = async (newDayData) => {
    if (!activeGroup?.id) return;

    try {
      const { data, error } = await supabase
        .from('days')
        .insert([
          {
            group_id: activeGroup.id,
            title: newDayData.title,
            date: newDayData.date
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setScheduleDays(prev => [...prev, data]);
      setActiveDay(data.id);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed adding new day to Supabase:", err.message);
    }
  };

  const handleAddActivitySubmit = async (newAct) => {
    if (!activeDay) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([
          {
            day_id: activeDay,
            time: newAct.time || 'Flexible',
            type: newAct.type,
            title: newAct.title,
            location: newAct.location || 'Not Specified',
            details: newAct.details || '',
            cost: newAct.cost || 'Free',
            link: newAct.link || '#'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [...prev, {
        id: data.id,
        dayId: data.day_id,
        time: data.time,
        type: data.type,
        title: data.title,
        location: data.location,
        details: data.details,
        cost: data.cost,
        link: data.link
      }]);
      
      setIsActivityModalOpen(false);
    } catch (err) {
      console.error("Failed adding activity to Supabase:", err.message);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev => prev.filter(act => act.id !== activityId));
    } catch (err) {
      console.error("Failed deleting activity from Supabase:", err.message);
    }
  };

  const handleUpdateTripHeader = async (updatedFields) => {
    if (!activeGroup?.id) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .update({
          name: updatedFields.title,      
          dates: updatedFields.dates,     
          planner: updatedFields.planner,
          cost: updatedFields.cost
        })
        .eq('id', activeGroup.id)
        .select()
        .single();

      if (error) throw error;

      setGroups(prevGroups => prevGroups.map(g => g.id === activeGroup.id ? data : g));
      setActiveGroup(data);

    } catch (err) {
      console.error("Failed to sync header details with backend database:", err.message);
      throw err; 
    }
  };

  const handleCreateGroupSubmit = async (newGroup) => {
    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          name: newGroup.name,
          icon: newGroup.icon || '✈️'
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setGroups([data, ...groups]);
      setActiveGroup(data);
      setIsCreateGroupOpen(false);
    } else if (error) {
      console.error("Could not save new group:", error);
    }
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentDayObject = scheduleDays.find(d => d.id === activeDay);
  const currentDayTitleString = currentDayObject ? `Day ${currentDayObject.id} • ${currentDayObject.title}` : '';
  
  const handleOpenAddDay = () => {
    setCurrentEditingDay(null);
    setIsDayModalOpen(true);
  };

  const handleOpenEditDay = (dayObj) => {
    setCurrentEditingDay(dayObj);
    setIsDayModalOpen(true);
  };

  const handleUpdateDay = async (updatedDay) => {
    try {
      const { data, error } = await supabase
        .from('days')
        .update({
          title: updatedDay.title,
          date: updatedDay.date
        })
        .eq('id', updatedDay.id)
        .select()
        .single();

      if (error) throw error;
      setScheduleDays(prevDays => prevDays.map(day => day.id === updatedDay.id ? data : day));
    } catch (err) {
      console.error("Failed to update day in Supabase:", err.message);
    }
  };

  const handleDeleteDay = async (dayId) => {
    if (window.confirm("Are you sure you want to delete this day?")) {
      try {
        const { error } = await supabase.from('days').delete().eq('id', dayId);
        if (error) throw error;

        setScheduleDays(prevDays => prevDays.filter(day => day.id !== dayId));
        if (activeDay === dayId) {
          setActiveDay(null);
        }
      } catch (err) {
        console.error("Failed to delete day from Supabase:", err.message);
      }
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F9FAFB] text-[#111827] flex p-6 gap-6 relative">
      
      {/* LEFT SIDEBAR PANEL */}
      <div className="w-full md:w-[380px] flex flex-col gap-4 shrink-0">
        <GroupSearch 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />
        <GroupList 
          groups={filteredGroups} 
          activeGroup={activeGroup} 
          onSelectGroup={(group) => { setActiveGroup(group); setViewMode('chat'); }} 
          onCreateGroupClick={() => setIsCreateGroupOpen(true)} 
        />
      </div>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col gap-6">
        {activeGroup ? (
          viewMode === 'chat' ? (
            <ActiveChat 
              activeGroup={activeGroup}
              messages={activeGroupMessages}
              messageInput={messageInput}    
              onMessageChange={setMessageInput}
              onSendMessage={handleSendMessage}
              onOpenSchedule={() => setViewMode('schedule')}
              onUpdateGroup={(updatedMeta) => {
                setGroups(groups.map(g => g.id === activeGroup.id ? { ...g, ...updatedMeta } : g));
                setActiveGroup(prev => ({ ...prev, ...updatedMeta }));
              }}
              onCreatePoll={handleCreatePoll}
              onCastVote={handleCastVote}
            />
          ) : (
            <div className="flex flex-col gap-6 animate-fadeIn w-full pb-12">
              <ScheduleHeader 
                activeGroup={activeGroup}
                onBackToChat={handleBackToChat}
                onUpdateGroupHeader={handleUpdateTripHeader} 
              />
              
              <DaySelector 
                days={scheduleDays} 
                activeDay={activeDay}
                onSelectDay={setActiveDay}
                onOpenModal={handleOpenAddDay}      
                onOpenEditModal={handleOpenEditDay}  
                onDeleteDay={handleDeleteDay}        
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.filter(act => String(act.dayId) === String(activeDay)).map(activity => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    onDeleteActivity={handleDeleteActivity}
                  />
                ))}
                {activities.filter(act => String(act.dayId) === String(activeDay)).length === 0 && (
                  <div className="col-span-full border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400 bg-white">
                    No activities planned for this day yet. Click "Add activity" below to start planning!
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center w-full mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#0F5132] hover:bg-[#0B3D25] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer tracking-wide uppercase"
                >
                  <Plus className="w-3.5 h-3.5 transform group-hover:rotate-90 transition-transform duration-200" />
                  <span>Add activity</span>
                </button>
              </div>

            </div>
          )
        ) : (
          <EmptyState />
        )}
      </div>

      {/* OVERLAY MODAL PORTALS */}
      <AddDayModal 
        isOpen={isDayModalOpen} 
        onClose={() => setIsDayModalOpen(false)} 
        onAddDay={async (newDayData) => {
          await handleAddDaySubmit(newDayData);
          setIsDayModalOpen(false);
        }} 
        onUpdateDay={async (updatedDay) => {
          await handleUpdateDay(updatedDay);
          setIsDayModalOpen(false);
        }}
        editingDay={currentEditingDay}
      />

      <AddActivityModal 
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onAddActivity={handleAddActivitySubmit}
        currentDayTitle={currentDayTitleString}
      />

      <CreateGroupModal 
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroupSubmit}
      />

    </div>
  );
}