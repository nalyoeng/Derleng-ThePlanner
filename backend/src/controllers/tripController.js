import supabase from '../config/supabase.js';

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
    console.error("Error fetching trip days:", error);
    res.status(500).json({ error: "Failed to fetch itinerary schedule" });
  }
};

export const createActivity = async (req, res) => {
  // Good practice: Destructure and validate
  const { day_id, time, type, title, location, details, cost, link } = req.body;

  if (!day_id || !title) {
    return res.status(400).json({ error: "Missing required activity fields" });
  }

  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([{ day_id, time: time || 'Flexible', type, title, location, details, cost, link }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivitiesByDay = async (req, res) => {
  const { dayId } = req.params;
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('day_id', dayId)
      .order('time', { ascending: true }); // Orders by time for better UI display

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

export const deleteActivity = async (req, res) => {
  const { activityId } = req.params;
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);

    if (error) throw error;
    res.status(204).send(); // 204 means success with no content to return
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};