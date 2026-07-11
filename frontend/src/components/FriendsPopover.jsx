import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient.js';

export default function FriendsPopover({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 1. Get current user and initial following list
  useEffect(() => {
    if (!isOpen) return;

    const initializeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Fetch IDs of people the current user is already following
      const { data: follows, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!error && follows) {
        setFollowingIds(new Set(follows.map(f => f.following_id)));
      }
      
      // Load initial suggestions
      fetchSuggestions(user.id);
    };

    initializeData();
  }, [isOpen]);

  // 2. Fetch people you might know (excluding yourself)
  const fetchSuggestions = async (myId) => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, initials')
      .neq('id', myId)
      .limit(5);

    if (!error && profiles) {
      // Map background colors randomly or procedurally for avatars
      const colors = ['bg-[#E05A26]', 'bg-[#2D5A3E]', 'bg-[#C59124]'];
      const mapped = profiles.map((p, idx) => ({
        ...p,
        bgColor: colors[idx % colors.length]
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      fetchSuggestions(currentUserId);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`http://localhost:5000/api/follow/search?username=${value}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      console.log("Search API Raw Result:", result); // 🌟 Debug log to see exactly what backend sends back

      if (result.success && result.data) {
        const colors = ['bg-[#E05A26]', 'bg-[#2D5A3E]', 'bg-[#C59124]'];
        const mappedResults = result.data.map((p, idx) => ({
          ...p,
          bgColor: colors[idx % colors.length]
        }));
        setUsers(mappedResults);
      } else {
        setUsers([]); // Clear out list if success is false
      }
    } catch (err) {
      console.error("Failed to fetch users from search API:", err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Follow or Unfollow action handler
  const handleFollowToggle = async (targetUserId) => {
    if (!currentUserId) return;

    const isFollowing = followingIds.has(targetUserId);

    if (isFollowing) {
      // Unfollow action
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (!error) {
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      }
    } else {
      // Follow action
      const { error } = await supabase
        .from('follows')
        .insert([{ follower_id: currentUserId, following_id: targetUserId }]);

      if (!error) {
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.add(targetUserId);
          return next;
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop layer to close popover when clicking anywhere outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Main Popover Card Box */}
      <div className="absolute right-4 top-16 w-[360px] bg-[#F4F1EC] rounded-3xl p-5 shadow-xl border border-[#E6E1D8] z-50 animate-in fade-in zoom-in-95 duration-100">
        
        {/* Header containing title and absolute close action */}
        <div className="relative flex items-center justify-center mb-4">
          <h3 className="text-black font-semibold text-lg tracking-wide font-sans">
            Network
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
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search users by name..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[#EFECE6] border border-[#E3DDD4] text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Dynamic Title Subheading */}
        <div className="mb-3 pl-1">
          <h4 className="text-black font-medium text-sm tracking-wide">
            {searchQuery ? 'Search Results' : 'People You May Know'}
          </h4>
        </div>

        {/* Loading Spinner State */}
        {loading && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {/* Suggestion Stack Rows Container */}
        <div className="flex flex-col gap-2.5">
          {!loading && users.map((person) => {
            const isFollowing = followingIds.has(person.id);
            return (
              <div
                key={person.id}
                className="w-full h-14 bg-[#EFECE6] border border-[#E3DDD4]/60 rounded-2xl flex items-center justify-between px-4 transition-all hover:bg-[#EAE6DF]"
              >
                {/* Left Side: Avatar block and Identity */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${person.bgColor} flex items-center justify-center text-white text-xs font-bold tracking-wider shadow-sm`}>
                    {person.initials || '??'}
                  </div>
                  <span className="text-[#C5A86B] font-medium text-sm tracking-wide font-serif">
                    {person.full_name}
                  </span>
                </div>

                {/* Right Side: Follow toggle button setup */}
                <button 
                  onClick={() => handleFollowToggle(person.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                    isFollowing 
                      ? 'bg-[#2D5A3E] text-white hover:bg-[#234630]' 
                      : 'text-black hover:bg-black/5'
                  }`}
                >
                  {isFollowing ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  )}
                </button>
              </div>
            );
          })}

          {!loading && users.length === 0 && (
            <div className="text-center py-4 text-xs text-gray-400">
              No matching profiles found.
            </div>
          )}
        </div>

      </div>
    </>
  );
}