import supabase from '../config/supabase.js'

/**
 * Verifies a Supabase access token and loads the matching application profile.
 * Adds req.user, req.profile, and req.accessToken for protected controllers.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.',
      })
    }

    const token = authHeader.slice(7).trim()

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.',
      })
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        email,
        initials,
        phone,
        bio,
        avatar_url,
        role,
        ban_type,
        created_at,
        updated_at
      `)
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile loading error:', profileError)
      return res.status(500).json({
        success: false,
        message: 'The profile could not be loaded.',
      })
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: 'A profile was not found for this account.',
      })
    }

    if (profile.ban_type === 'full_ban') {
      return res.status(403).json({
        success: false,
        message: 'This account is suspended.',
      })
    }

    req.user = user
    req.profile = profile
    req.accessToken = token

    return next()
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'The server could not authenticate the account.',
    })
  }
}
