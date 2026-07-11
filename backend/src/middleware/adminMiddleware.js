import supabase from '../config/supabase.js';

// ── Check if user is logged in ──────────────────────────────
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found.' });
    }

    // Check if user is fully banned
    if (profile.ban_type === 'full_ban') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Attach user and profile to request
    req.user    = user;
    req.profile = profile;
    next();

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.', details: err.message });
  }
};

// ── Check if user is super admin ────────────────────────────
export const isSuperAdmin = (req, res, next) => {
  if (req.profile?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied. Super Admin only.' });
  }
  next();
};

// ── Check if user is any kind of admin ──────────────────────
export const isAdmin = (req, res, next) => {
  const adminRoles = ['super_admin', 'place_manager', 'moderator'];
  if (!adminRoles.includes(req.profile?.role)) {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// ── Check if user is moderator or super admin ────────────────
export const isModerator = (req, res, next) => {
  const allowed = ['super_admin', 'moderator'];
  if (!allowed.includes(req.profile?.role)) {
    return res.status(403).json({ error: 'Access denied. Moderators only.' });
  }
  next();
};

// ── Check if user is place manager or super admin ────────────
export const isPlaceManager = (req, res, next) => {
  const allowed = ['super_admin', 'place_manager'];
  if (!allowed.includes(req.profile?.role)) {
    return res.status(403).json({ error: 'Access denied. Place Managers only.' });
  }
  next();
};