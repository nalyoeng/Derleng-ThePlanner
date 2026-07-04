// backend/src/controllers/pollController.js
// 🌟 Don't forget the '.js' extension on local config imports!
import supabase from '../config/supabase.js'; 

// 1. Fetch polls for a specific group layout room
export const getPollsByGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, poll_options(*)')
      .eq('group_id', groupId)
      .eq('type', 'poll');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Insert new poll row logic
export const createPoll = async (req, res) => {
  try {
    res.status(201).json({ success: true, message: "Poll logic placeholder working!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};