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
import CreatePollModal from './chatArea/CreatePollModal';
import { supabase } from '../../supabaseClient.js';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function Chatpage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('chat');
  const [activeDay, setActiveDay] = useState(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [scheduleDays, setScheduleDays] = useState([]);
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentEditingDay, setCurrentEditingDay] = useState(null); 
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [userFollowsList, setUserFollowsList] = useState([]);
  const [groupMembersTable, setGroupMembersTable] = useState([]);

  const activeGroupMessages = messages.filter(msg => 
    String(msg.group_id) === String(activeGroup?.id)
  );

  const handleBackToChat = () => {
    setViewMode('chat');
  };

  const makeInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    return name.trim().split(' ').map(n => n?.[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  useEffect(() => {
    if (groupId && groups.length > 0) {
      const foundGroup = groups.find(g => String(g.id) === String(groupId));
      if (foundGroup) {
        setActiveGroup(foundGroup);
      }
    }
  }, [groupId, groups]);

  // Sync ViewMode based on Path
  useEffect(() => {
    setViewMode(location.pathname.endsWith('/days') ? 'schedule' : 'chat');
  }, [location.pathname]);

  // --- 1. FETCH PROFILE ON MOUNT ---
  useEffect(() => {
    const getLoggedInUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0]
        });
      }
    };
    getLoggedInUser();
  }, []);

  // --- 2. FETCH GROUPS ON MOUNT ---
  useEffect(() => {
    const fetchGroups = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          role,
          groups (
            id,
            name,
            icon,
            leader,
            created_at,
            dates,            
            estimate_cost,
            group_members(count)
          )
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        const userJoinedGroups = data
          .filter(m => m.groups !== null)
          .map(m => ({
            id: m.groups.id,
            name: m.groups.name,
            icon: m.groups.icon,
            created_at: m.groups.created_at,
            role: m.role,
            dates: m.groups.dates,         
            estimate_cost: m.groups.estimate_cost,
            member_count: m.groups.group_members?.[0]?.count || 1 
          }));
        
        setGroups(userJoinedGroups);
      } else if (error) {
        console.error("Error loading user-specific workspace groups:", error);
      }
    };

    fetchGroups();
  }, []); 

  // --- 3. FETCH ACTIVE GROUP DATA ---
  useEffect(() => {
    if (!activeGroup?.id) return;

    const loadModalData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username');
      if (profiles) setAllProfiles(profiles);

      const { data: members } = await supabase
        .from('group_members')
        .select('id, group_id, user_id, role')
        .eq('group_id', activeGroup.id);
      if (members) setGroupMembersTable(members);

      const { data: fetchedMessages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', activeGroup.id)
        .order('created_at', { ascending: true });

      if (msgError || !fetchedMessages) return;

      // Safe poll fetching to prevent empty array crashes
      const msgIds = fetchedMessages.map(m => m.id);
      let pollOptionsData = [];
      
      if (msgIds.length > 0) {
        const { data } = await supabase
          .from('poll_options')
          .select('*, poll_votes(*)')
          .in('message_id', msgIds);
        pollOptionsData = data || [];
      }

      const formattedMessages = fetchedMessages.map(msg => {
        const msgProfile = profiles?.find(p => p.id === msg.sender_id);
        const senderName = msgProfile?.full_name || 'Classmate';

        return {
          ...msg,
          sender: msg.sender_id === user.id ? 'You' : senderName,
          initials: makeInitials(senderName),
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: msg.sender_id === user.id,
          pollOptions: msg.type === 'poll' 
            ? pollOptionsData.filter(o => o.message_id === msg.id).map(opt => ({
                ...opt,
                votesCount: opt.poll_votes?.length || 0,
                hasVotedByMe: opt.poll_votes?.some(v => v.user_id === user.id)
              }))
            : []
        };
      });

      setMessages(formattedMessages);
    };

    loadModalData();
  }, [activeGroup?.id]);

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
        (payload) => {
          const freshMsg = {
            id: payload.new.id,
            groupId: payload.new.group_id,
            text: payload.new.text,
            sender: payload.new.sender_id === currentUserProfile?.id ? 'You' : 'Classmate',
            initials: payload.new.sender_id === currentUserProfile?.id ? makeInitials(currentUserProfile?.full_name) : 'CM',
            time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: currentUserProfile ? payload.new.sender_id === currentUserProfile.id : false,
            type: payload.new.type,
            pollData: null
          };

          setMessages(prev => {
            if (prev.some(m => m.id === freshMsg.id)) return prev;
            return [...prev, freshMsg];
          });
        }
      )
      .subscribe();

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
          .from('schedule_days')
          .select('*')
          .eq('group_id', activeGroup.id)
          .order('date', { ascending: true });

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
    if (!messageInput.trim() || !activeGroup?.id || !currentUserProfile?.id) return;

    const currentText = messageInput;
    setMessageInput(''); // Clear input instantly for good UX

    // 1. Add .select().single() to return the newly created row instantly
    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert([{
        group_id: activeGroup.id,
        text: currentText.trim(),
        sender_id: currentUserProfile.id, 
        type: 'text'
      }])
      .select()
      .single();

    if (error) {
      console.error("Failed to sync message to backend:", error);
      setMessageInput(currentText); // Put text back if it fails
    } else if (newMsg) {
      // 2. Format the new message exactly like your initial load does
      const formattedNewMsg = {
        ...newMsg,
        sender: 'You',
        initials: makeInitials(currentUserProfile.full_name),
        time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        pollOptions: []
      };

      // 3. Inject it instantly into the UI
      setMessages(prev => {
        // Safety check to prevent duplicates just in case the websocket *does* catch it
        if (prev.some(m => m.id === formattedNewMsg.id)) return prev;
        return [...prev, formattedNewMsg];
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup?.id || !currentUserProfile?.id) return;
    
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', activeGroup.id)
      .eq('user_id', currentUserProfile.id);

    if (!error) {
      setGroups(prev => prev.filter(g => g.id !== activeGroup.id));
      setActiveGroup(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup?.id) return;

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', activeGroup.id);

    if (!error) {
      setGroups(prev => prev.filter(g => g.id !== activeGroup.id));
      setActiveGroup(null);
    }
  };

  const handleInviteFriendToGroup = async (friendId, groupId) => {
    const { data, error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: friendId, role: 'Member' }])
      .select()
      .single();

    if (!error && data) {
      setGroupMembersTable(prev => [...prev, data]);
    }
  };

  // --- 8. POLL VOTING TRANSACTIONS ---
  const handleCastVote = async (messageId, optionId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('option_id', optionId)
        .maybeSingle();

      if (existingVote) {
        await supabase.from('poll_votes').delete().eq('id', existingVote.id);
      } else {
        await supabase.from('poll_votes').insert([{ group_id: activeGroup.id, option_id: optionId, user_id: user.id }]);
      }

      const { count, error: countError } = await supabase
        .from('poll_votes')
        .select('*', { count: 'exact', head: true })
        .eq('option_id', optionId);

      if (countError) throw countError;

      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id !== messageId) return msg;
          
          return {
            ...msg,
            pollOptions: msg.pollOptions?.map(opt => {
              if (opt.id !== optionId) return opt;
              return { ...opt, votesCount: count, hasVotedByMe: !existingVote };
            }) || []
          };
        })
      );
    } catch (err) {
      console.error("Error updating poll vote status:", err.message);
    }
  };

  // --- 9. ITINERARY & GROUP MUTATIONS ---
  const handleAddDaySubmit = async (newDayData) => {
    if (!activeGroup?.id) return;
    try {
      const { data, error } = await supabase
        .from('schedule_days')
        .insert([{ group_id: activeGroup.id, title: newDayData.title, date: newDayData.date }])
        .select()
        .single();

      if (error) throw error;
      setScheduleDays(prev => [...prev, data]);
      setActiveDay(data.id);
    } catch (err) {
      console.error("Failed adding new day to Supabase:", err.message);
    }
  };

  const handleUpdateDay = async (updatedDay) => {
    try {
      const { data, error } = await supabase
        .from('schedule_days')
        .update({ title: updatedDay.title, date: updatedDay.date })
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
        const { error } = await supabase.from('schedule_days').delete().eq('id', dayId);
        if (error) throw error;
        setScheduleDays(prevDays => prevDays.filter(day => day.id !== dayId));
        if (activeDay === dayId) setActiveDay(null);
      } catch (err) {
        console.error("Failed to delete day from Supabase:", err.message);
      }
    }
  };

  const handleAddActivitySubmit = async (newAct) => {
    if (!activeDay || !activeGroup?.id) return;
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          day_id: activeDay,
          group_id: activeGroup.id,
          time: newAct.time || 'Flexible',
          type: newAct.type,
          title: newAct.title,
          location: newAct.location || 'Not Specified',
          details: newAct.details || '',
          cost: newAct.cost || 'Free',
          link: newAct.link || '#'
        }])
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
      const { error } = await supabase.from('activities').delete().eq('id', activityId);
      if (error) throw error;
      setActivities(prev => prev.filter(act => act.id !== activityId));
    } catch (err) {
      console.error("Failed deleting activity from Supabase:", err.message);
    }
  };

  // Add this in Chatpage.jsx
const handleUpdateTripHeader = async (updatedFields) => {
  if (!activeGroup?.id) return;

  try {
    const { data, error } = await supabase
      .from('groups') // Ensure this is your correct table name
      .update({
        name: updatedFields.name,
        dates: updatedFields.dates, // Ensure 'dates' column exists
        estimate_cost: updatedFields.estimate_cost
      })
      .eq('id', activeGroup.id)
      .select()
      .single();

    if (error) throw error;

    // Update the local state so the UI reflects the change immediately
    setGroups(prev => prev.map(g => g.id === activeGroup.id ? { ...g, ...data } : g));
    setActiveGroup(data);
    
    console.log("Trip updated successfully!");
  } catch (err) {
    console.error("Update failed:", err.message);
    alert("Could not update trip: " + err.message); // Visual feedback
  }
};

  const handleCreateGroupSubmit = async (newGroup) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert([{ name: newGroup.name, icon: newGroup.icon || '✈️', leader: user.id }])
      .select()
      .single();

    if (groupError || !groupData) return;

    const rosterPayload = [{ group_id: groupData.id, user_id: user.id, role: 'Leader' }];
    if (Array.isArray(newGroup.memberIds)) {
      newGroup.memberIds.forEach(friendId => {
        rosterPayload.push({ group_id: groupData.id, user_id: friendId, role: 'Member' });
      });
    }

    const { error: memberError } = await supabase.from('group_members').insert(rosterPayload);
    if (!memberError) {
      const formattedNewGroup = {
        id: groupData.id,
        name: groupData.name,
        icon: groupData.icon,
        created_at: groupData.created_at,
        role: 'Leader',
        member_count: rosterPayload.length 
      };
      setGroups([formattedNewGroup, ...groups]);
      setActiveGroup(formattedNewGroup);
      setIsCreateGroupOpen(false);
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

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F9FAFB] text-[#111827] flex p-6 gap-6 relative">
      
      {/* LEFT SIDEBAR PANEL */}
      <div className="w-full md:w-[380px] flex flex-col gap-4 shrink-0">
        <GroupSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <GroupList 
          groups={filteredGroups} 
          activeGroup={activeGroup} 
          onSelectGroup={(group) => { 
            setActiveGroup(group); 
            navigate(`/chat/${group.id}`); 
          }} 
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
              onPollCreated={() => setIsPollModalOpen(true)} 
              onCastVote={handleCastVote}
              currentUserProfile={currentUserProfile}
              onLeaveGroup={handleLeaveGroup}
              onDeleteGroup={handleDeleteGroup}
              onInviteFriend={handleInviteFriendToGroup}
              groupMembersTable={groupMembersTable}
              friendsList={userFollowsList}
              usersList={allProfiles.map(p => ({
                id: p.id,
                name: p.full_name,
                initials: makeInitials(p.full_name)
              }))}
            />
          ) : (
            <div className="flex flex-col gap-6 animate-fadeIn w-full pb-12">
              <ScheduleHeader 
                activeGroup={activeGroup}
                allProfiles={allProfiles}
                groupMembersTable={groupMembersTable} 
                onBackToChat={handleBackToChat}
                onUpdateGroupHeader={handleUpdateTripHeader} 
                onOpenEditModal={() => setIsEditModalOpen(true)}
                isEditModalOpen={isEditModalOpen}
                onCloseEditModal={() => setIsEditModalOpen(false)}
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
      <CreateGroupModal 
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroupSubmit}
        currentUserId={currentUserProfile?.id}
      />

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
        groupId={activeGroup?.id}
      />

      <AddActivityModal 
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onAddActivity={handleAddActivitySubmit}
        currentDayTitle={currentDayTitleString}
        dayId={activeDay}
        groupId={activeGroup?.id}
      />

      <CreatePollModal 
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        groupId={activeGroup?.id}
        onPollCreated={() => {
          setIsPollModalOpen(false);
        }}
      />

    </div>
  );
}