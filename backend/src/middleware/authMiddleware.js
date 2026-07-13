import supabase from '../config/supabase.js'

export const protect = async (req,res,next) => {
  try {
    const authHeader =req.headers.authorization

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        message:'Authentication token is missing.',
      })
    }

    const token = authHeader.slice(7).trim()

    if (!token) {
      return res.status(401).json({
        success: false,
        message:'Authentication token is missing.',
      })
    }

    const { data: { user },error: userError,} = await supabase.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message:'Invalid or expired authentication token.',
      })
    }
    const {data: profile,error: profileError,} = await supabase.from('profiles')
      .select(`
        id,
        username,
        full_name,
        email,
        initials,
        phone,
        bio,
        avatar_url,
        role
      `)
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error(
        'Profile loading error:',
        profileError
      )

      return res.status(403).json({
        success: false,
        message:'A profile was not found for this account.',
      })
    }

    req.user = user
    req.profile = profile
    req.accessToken = token

    next()
  } catch (error) {
    console.error('Authentication middleware error:', error)

    return res.status(500).json({
      success: false,
      message:'The server could not authenticate the account.',
    })
  }
}