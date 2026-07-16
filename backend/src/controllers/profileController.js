import supabase from '../config/supabase.js'

const getAuthenticatedUserId = (req) => {
  return req.profile?.id || req.user?.id
}

// GET /api/profile/me
export const getMyProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required.',
      })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        role,
        ban_type
      `)
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Get profile error:', error)

      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        ...profile,
        email: req.user?.email || null,
      },
    })
  } catch (error) {
    console.error('Get profile controller error:', error)

    return res.status(500).json({
      success: false,
      message: 'Could not load profile.',
    })
  }
}

// PATCH /api/profile/me
export const updateMyProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required.',
      })
    }

    const { full_name, avatar_url } = req.body
    const updates = {}

    if (full_name !== undefined) {
      if (typeof full_name !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Full name must be text.',
        })
      }

      const cleanedFullName = full_name.trim()

      if (
        cleanedFullName.length < 2 ||
        cleanedFullName.length > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Full name must contain between 2 and 100 characters.',
        })
      }

      updates.full_name = cleanedFullName
    }

    if (avatar_url !== undefined) {
      if (
        avatar_url !== null &&
        typeof avatar_url !== 'string'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Avatar URL must be text.',
        })
      }

      updates.avatar_url =
        avatar_url === null || avatar_url.trim() === ''
          ? null
          : avatar_url.trim()
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Provide full_name or avatar_url to update.',
      })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        role,
        ban_type
      `)
      .single()

    if (error) {
      console.error('Update profile error:', error)

      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        ...profile,
        email: req.user?.email || null,
      },
    })
  } catch (error) {
    console.error(
      'Update profile controller error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Could not update profile.',
    })
  }
}