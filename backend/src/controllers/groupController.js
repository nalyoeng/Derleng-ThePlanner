// controllers/groupController.js
import db from '../config/supabase.js'; 

export const getUserGroups = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID parameter is required" });
  }

  try {
    // 🌟 Using Supabase query builder to handle the table join securely
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

    // Flatten data slightly to match what your frontend expects
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