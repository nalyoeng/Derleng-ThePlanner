// controllers/groupController.js
import db from '../config/supabase.js'; 

export const getUserGroups = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID parameter is required" });
  }

  try {
    const { data, error } = await db
      .from('groups')
      .select(`
        id,
        name,
        icon,
        created_at,
        group_members!inner(role, user_id)
      `)
      .eq('group_members.user_id', userId);

    if (error) throw error;

    const formattedRows = data.map(group => ({
      id: group.id,
      name: group.name,
      icon: group.icon,
      created_at: group.created_at,
      role: group.group_members[0]?.role
    }));

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error("Error in getUserGroups controller:", error);
    return res.status(500).json({ error: "Database query execution failure" });
  }
};

export const inviteUser = async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ error: "Missing groupId or userId" });
  }

  try {
    const { data, error } = await db
      .from('group_members')
      .insert([
        { group_id: groupId, user_id: userId, role: 'Member' }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      newMember: data[0]
    });
  } catch (error) {
    console.error("Error in inviteUser controller:", error);
    return res.status(500).json({ error: "Database insertion failed" });
  }
};

export const getGroupById = async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  try {
    const { data, error } = await db
      .from('groups')
      .select(`
        id,
        name,
        icon,
        leader,
        dates,
        estimate_cost,
        created_at,
        profiles!groups_leader_fkey (full_name)
      `)
      .eq('id', groupId)
      .single(); // expect exactly one group

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Group not found" });

    const formattedGroup = {
      ...data,
      leader_name: data.profiles?.full_name || 'Unknown'
    };
    // Remove the nested profiles object from the final output
    delete formattedGroup.profiles;

    return res.status(200).json(formattedGroup);
  } catch (error) {
    console.error("Error in getGroupById controller:", error);
    return res.status(500).json({ error: "Database query failure" });
  }
};

export const updateGroupSchedule = async (req, res) => {
  const { groupId } = req.params;
  const { name, dates, estimate_cost } = req.body;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  try {
    const { data, error } = await db
      .from('groups')
      .update({
        name,
        dates,
        estimate_cost
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error updating group schedule:", error);
    return res.status(500).json({ error: "Failed to update group details" });
  }
};