import supabase from '../config/supabase.js';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '../../../backups');
 
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
 
// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/users — get all users
export const getAllUsers = async (req, res) => {
  try {


    console.log('=== getAllUsers called by user:', req.profile?.email || 'unknown');
    console.log('User role:', req.profile?.role);


    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, ban_type, created_at')
      .order('created_at', { ascending: false });


    if (error) {
      console.error('Supabase Error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log(`Successfully fetched ${data?.length || 0} users`);
    return res.status(200).json({ users: data });
  } catch (err) {
    console.error(' Server Error in getAllUsers:', err);

    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// CREATE ADMIN & REVOKE
// ═══════════════════════════════════════════════════════════════

// POST /api/admin/create — create a new admin account
export const createAdmin = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Validate
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const validRoles = ['place_manager', 'moderator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be place_manager or moderator.' });
    }

    // Create user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Update their role in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role, full_name })
      .eq('id', authData.user.id);

    if (profileError) return res.status(400).json({ error: profileError.message });

    // Log the action in audit_log
    await supabase.from('audit_log').insert({
      target_user_id: authData.user.id,
      changed_by_id:  req.profile.id,
      old_role:       'user',
      new_role:       role,
      action:         'role_granted',
    });

    return res.status(201).json({ message: `Admin account for ${full_name} created successfully.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/revoke/:id — revoke admin back to user
export const revokeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current role before revoking
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', id)
      .single();

    if (fetchError || !profile) return res.status(404).json({ error: 'User not found.' });

    if (profile.role === 'user') {
      return res.status(400).json({ error: 'User is already a regular user.' });
    }

    if (profile.role === 'super_admin') {
      return res.status(400).json({ error: 'Cannot revoke super admin.' });
    }

    // Demote to user
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });

    // Log the action
    await supabase.from('audit_log').insert({
      target_user_id: id,
      changed_by_id:  req.profile.id,
      old_role:       profile.role,
      new_role:       'user',
      action:         'role_revoked',
    });

    return res.status(200).json({ message: `${profile.full_name}'s admin access has been revoked.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/edit-role/:id — edit admin role
export const editAdminRole = async (req, res) => {
  try {
    const { id }      = req.params;
    const { newRole } = req.body;

    const validRoles = ['place_manager', 'moderator'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });

    // Log the action
    await supabase.from('audit_log').insert({
      target_user_id: id,
      changed_by_id:  req.profile.id,
      old_role:       profile.role,
      new_role:       newRole,
      action:         'role_updated',
    });

    return res.status(200).json({ message: 'Role updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// DESTINATIONS
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/destinations — get all destinations
export const getAllDestinations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ destinations: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/destinations — add new destination
export const createDestination = async (req, res) => {
  try {
    const { name, location, categories, status, cost, image_url } = req.body;

    if (!name || !location || !categories || !cost) {
      return res.status(400).json({ error: 'Name, location, categories and cost are required.' });
    }

    if (cost <= 0) {
      return res.status(400).json({ error: 'Cost must be a positive number.' });
    }

    const { data, error } = await supabase
      .from('destinations')
      .insert({
        name,
        location,
        categories,
        status:     status || 'Active',
        cost,
        image_url:  image_url || null,
        created_by: req.profile.id,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ message: 'Destination created successfully.', destination: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/destinations/:id — update destination
export const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, categories, status, cost, image_url } = req.body;

    if (cost && cost <= 0) {
      return res.status(400).json({ error: 'Cost must be a positive number.' });
    }

    const { data, error } = await supabase
      .from('destinations')
      .update({ name, location, categories, status, cost, image_url, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Destination updated successfully.', destination: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/destinations/:id — delete destination
export const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Destination deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════

// GET /api/admin/reports — get all reports
export const getAllReports = async (req, res) => {
  try {
    // Get all reports first
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    // Get profile info for each report
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const { data: reportedUser } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', report.reported_user_id)
          .single();

        const { data: reportedBy } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', report.reported_by_id)
          .single();

        return {
          ...report,
          reported_user: reportedUser,
          reported_by:   reportedBy,
        };
      })
    );

    return res.status(200).json({ reports: enrichedReports });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/reports/:id/dismiss — dismiss a report
export const dismissReport = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('reports')
      .update({ status: 'Dismissed' })
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Report dismissed.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// BAN & RESTRICTIONS
// ═══════════════════════════════════════════════════════════════

// PATCH /api/admin/ban/:id — full ban or comment ban a user
export const banUser = async (req, res) => {
  try {
    const { id }       = req.params;
    const { ban_type, reason, report_id } = req.body;

    const validBanTypes = ['full_ban', 'comment_ban'];
    if (!validBanTypes.includes(ban_type)) {
      return res.status(400).json({ error: 'Invalid ban type. Must be full_ban or comment_ban.' });
    }

    // Update ban_type in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ ban_type })
      .eq('id', id);

    if (profileError) return res.status(400).json({ error: profileError.message });

    // Insert into restrictions table
    await supabase.from('restrictions').insert({
      user_id:    id,
      type:       ban_type,
      reason:     reason || null,
      is_active:  true,
      created_by: req.profile.id,
    });

    // Mark report as resolved if report_id provided
    if (report_id) {
      await supabase
        .from('reports')
        .update({ status: 'Resolved' })
        .eq('id', report_id);
    }

    // Log action
    await supabase.from('audit_log').insert({
      target_user_id: id,
      changed_by_id:  req.profile.id,
      old_role:       'user',
      new_role:       'user',
      action:         `${ban_type}_applied`,
    });

    return res.status(200).json({ message: `User has been ${ban_type === 'full_ban' ? 'fully banned' : 'comment banned'} successfully.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/restrict/:id — restrict user for a time period
export const restrictUser = async (req, res) => {
  try {
    const { id }       = req.params;
    const { duration, reason, report_id } = req.body;

    // Calculate restricted_until based on duration string
    const durationMap = {
      '1 hour':   1  * 60 * 60 * 1000,
      '6 hours':  6  * 60 * 60 * 1000,
      '12 hours': 12 * 60 * 60 * 1000,
      '1 day':    1  * 24 * 60 * 60 * 1000,
      '3 days':   3  * 24 * 60 * 60 * 1000,
      '7 days':   7  * 24 * 60 * 60 * 1000,
      '30 days':  30 * 24 * 60 * 60 * 1000,
    };

    if (!durationMap[duration]) {
      return res.status(400).json({ error: 'Invalid duration.' });
    }

    const restricted_until = new Date(Date.now() + durationMap[duration]);

    // Insert restriction
    await supabase.from('restrictions').insert({
      user_id:          id,
      type:             'restricted',
      reason:           reason || null,
      restricted_until,
      is_active:        true,
      created_by:       req.profile.id,
    });

    // Mark report as resolved
    if (report_id) {
      await supabase
        .from('reports')
        .update({ status: 'Resolved' })
        .eq('id', report_id);
    }

    // Log action
    await supabase.from('audit_log').insert({
      target_user_id: id,
      changed_by_id:  req.profile.id,
      old_role:       'user',
      new_role:       'user',
      action:         'restriction_applied',
    });

    return res.status(200).json({ message: `User restricted until ${restricted_until.toISOString()}.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/lift/:id — lift a restriction or ban
export const liftRestriction = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user profile first
    const { data: profile } = await supabase
      .from('profiles')
      .select('ban_type')
      .eq('id', id)
      .single();

    // Reset ban_type to none in profiles
    await supabase
      .from('profiles')
      .update({ ban_type: 'none' })
      .eq('id', id);

    // Deactivate all active restrictions for this user
    await supabase
      .from('restrictions')
      .update({ is_active: false })
      .eq('user_id', id)
      .eq('is_active', true);

    // Log action
    await supabase.from('audit_log').insert({
      target_user_id: id,
      changed_by_id:  req.profile.id,
      old_role:       'user',
      new_role:       'user',
      action:         'restriction_lifted',
    });

    return res.status(200).json({ message: 'Restriction lifted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/restrictions — get all restrictions
export const getAllRestrictions = async (req, res) => {
  try {
    const { data: restrictions, error } = await supabase
      .from('restrictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const enrichedRestrictions = await Promise.all(
      restrictions.map(async (restriction) => {
        const { data: user } = await supabase
          .from('profiles')
          .select('id, full_name, email, ban_type')
          .eq('id', restriction.user_id)
          .single();

        const { data: createdByAdmin } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', restriction.created_by)
          .single();

        return {
          ...restriction,
          user,
          created_by_admin: createdByAdmin,
        };
      })
    );

    return res.status(200).json({ restrictions: enrichedRestrictions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// ═══════════════════════════════════════════════════════════════
// BACKUP & RECOVER
// ═══════════════════════════════════════════════════════════════
 
// POST /api/admin/backup — create a new backup
export const createBackup = async (req, res) => {
  try {
  const [
  { data: profiles },
  { data: destinations },
  { data: reports },
  { data: restrictions },
  { data: audit_log },
  { data: groups },
  { data: group_members },
  { data: messages },
  { data: activities },
  { data: schedule_days },
  { data: reviews },
  { data: follows },
  { data: favorites },
  { data: poll_options },
  { data: poll_votes },
] = await Promise.all([
  supabase.from('profiles').select('*'),
  supabase.from('destinations').select('*'),
  supabase.from('reports').select('*'),
  supabase.from('restrictions').select('*'),
  supabase.from('audit_log').select('*'),
  supabase.from('groups').select('*'),
  supabase.from('group_members').select('*'),
  supabase.from('messages').select('*'),
  supabase.from('activities').select('*'),
  supabase.from('schedule_days').select('*'),
  supabase.from('reviews').select('*'),
  supabase.from('follows').select('*'),
  supabase.from('favorites').select('*'),
  supabase.from('poll_options').select('*'),
  supabase.from('poll_votes').select('*'),
]);

const backup = {
  created_at: new Date().toISOString(),
  created_by: req.profile.email,
  tables: {
    profiles, destinations, reports, restrictions, audit_log,
    groups, group_members, messages, activities, schedule_days,
    reviews, follows, favorites, poll_options, poll_votes,
  },
};
 
    const now      = new Date();
    const pad      = (n) => String(n).padStart(2, '0');
    const filename = `backup_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
 
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
 
    const stats  = fs.statSync(filepath);
    const sizeKB = (stats.size / 1024).toFixed(1);
 
    return res.status(201).json({
      message:    'Backup created successfully.',
      filename,
      size:       `${sizeKB} KB`,
      created_at: backup.created_at,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
 
// GET /api/admin/backups — get list of all backup files
export const getBackups = async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.status(200).json({ backups: [] });
    }
 
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .map(filename => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats    = fs.statSync(filepath);
        const sizeKB   = (stats.size / 1024).toFixed(1);
        const parts    = filename.replace('backup_', '').replace('.json', '').split('_');
        const date     = parts[0];
        const timePart = parts[1]?.replace('-', ':') || '';
 
        return {
          filename,
          date:       new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          time:       timePart,
          size:       `${sizeKB} KB`,
          created_at: stats.birthtime,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
 
    return res.status(200).json({ backups: files });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
 
// POST /api/admin/recover — restore from a backup file
export const restoreBackup = async (req, res) => {
  try {
    const { filename } = req.body;
 
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required.' });
    }
 
    const filepath = path.join(BACKUP_DIR, filename);
 
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found.' });
    }
 
    const raw    = fs.readFileSync(filepath, 'utf-8');
    const backup = JSON.parse(raw);
 
    if (backup.tables.destinations?.length > 0) {
      const { error } = await supabase
        .from('destinations')
        .upsert(backup.tables.destinations, { onConflict: 'id' });
      if (error) throw new Error(`Destinations restore failed: ${error.message}`);
    }
 
    if (backup.tables.restrictions?.length > 0) {
      const { error } = await supabase
        .from('restrictions')
        .upsert(backup.tables.restrictions, { onConflict: 'id' });
      if (error) throw new Error(`Restrictions restore failed: ${error.message}`);
    }
 
    await supabase.from('audit_log').insert({
      target_user_id: null,
      changed_by_id:  req.profile.id,
      old_role:       null,
      new_role:       null,
      action:         `database_restored_from_${filename}`,
    });
 
    return res.status(200).json({
      message:     `Database restored from "${filename}" successfully.`,
      restored_at: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};