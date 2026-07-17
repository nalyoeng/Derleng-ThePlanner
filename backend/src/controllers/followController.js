import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { protect } from '../middleware/authMiddleware.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required' });
    }

    const { data: existingFollow, error: fetchError } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', targetUserId)
      .single();

    if (existingFollow) {
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', targetUserId);

      if (deleteError) throw deleteError;
      return res.status(200).json({ success: true, status: 'unfollowed', message: 'Successfully unfollowed user.' });
    } else {
      const { error: insertError } = await supabase
        .from('follows')
        .insert([{ follower_id: followerId, following_id: targetUserId }]);

      if (insertError) throw insertError;
      return res.status(200).json({ success: true, status: 'followed', message: 'Successfully followed user.' });
    }

  } catch (error) {
    console.error('Error in toggleFollow:', error.message);
    return res.status(500).json({ success: false, message: 'Server database transaction error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    const currentUserId = req.user.id;

    console.log("Backend Search Received for query:", username);
    console.log("Logged in User ID running search:", currentUserId);

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Removed the .ilike('name') filter that was causing the crash!
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .neq('id', currentUserId)
      .or(`username.ilike.%${username}%,full_name.ilike.%${username}%`);

    if (error) {
      console.error("Supabase Database Search Error:", error);
      throw error;
    }

    console.log("Database profiles found matching search:", profiles);
    return res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    console.error('Error searching users:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch users from database' });
  }
};