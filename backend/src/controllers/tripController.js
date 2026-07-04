import supabase from '../config/supabase.js';
const OBL_MOCK_DAYS = [
  { id: 1, group_id: 1, title: 'Arrival & Chill', date: 'Sat, Jul 18' },
  { id: 2, group_id: 1, title: 'Exploring the Hills', date: 'Sun, Jul 19' }
];
// Fetch all day segments for a group trip itinerary schedule
export const getTripDaysByGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const { data, error } = await supabase
      .from('trip_days')
      .select('*')
      .eq('group_id', groupId)
      .order('id', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    // Filter mock data locally to mimic database behavior
    const localFiltered = OBL_MOCK_DAYS.filter(d => String(d.group_id) === String(groupId));
    res.status(200).json(localFiltered);
    // res.status(500).json({ error: error.message });
  }
};

// Fetch planned activities mapping to a specific targeted Day ID
export const getActivitiesByDay = async (req, res) => {
  const { dayId } = req.params;
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('day_id', dayId)
      .order('time', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Persist a new structural activity record row object
export const createActivity = async (req, res) => {
  const { dayId, time, type, title, location, details, cost, link } = req.body;
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([
        { 
          day_id: dayId, 
          time: time || 'Flexible', 
          type, 
          title, 
          location, 
          details, 
          cost, 
          link 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};