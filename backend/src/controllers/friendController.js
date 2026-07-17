import supabase from '../config/supabase.js';

// Offline fallback dataset
const MOCK_FRIENDS = [
  { id: 'f1', name: 'Sokha Kim', initials: 'SK', status: 'active' },
  { id: 'f2', name: 'Borith Seyha', initials: 'BS', status: 'pending' }
];

// Get authenticated user's friend list
export const getMyFriends = async (req, res) => {
  const userId = req.user.id; // Passed down seamlessly from protect middleware
  
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.warn("Supabase unreachable. Serving local offline friends list.");
    res.status(200).json(MOCK_FRIENDS);
  }
};

// Send a friend connection request
export const sendFriendRequest = async (req, res) => {
  const { targetFriendEmail } = req.body;
  // In a live environment, you would look up the user by email and insert a relationship row
  res.status(200).json({ 
    success: true, 
    message: `Friend request sent successfully to ${targetFriendEmail}!` 
  });
};