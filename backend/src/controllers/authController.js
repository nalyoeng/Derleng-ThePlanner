import supabase from '../config/supabase.js'

const makeInitials = (fullName = '') =>
  fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

export const register = async (req, res) => {
  try {
    const { email, password, username, full_name } = req.body

    if (!email || !password || !username || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, username, and full_name are required.',
      })
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must contain at least 3 characters.',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim()
    const normalizedFullName = full_name.trim()
    const initials = makeInitials(normalizedFullName)

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          username: normalizedUsername,
          full_name: normalizedFullName,
          initials,
        },
      },
    })

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        message: 'The account could not be created.',
      })
    }

    // This also makes registration work if the auth trigger has not inserted
    // the profile yet. The service-role backend may safely upsert it.
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        username: normalizedUsername,
        full_name: normalizedFullName,
        email: normalizedEmail,
        initials,
        role: 'user',
        ban_type: 'none',
      },
      { onConflict: 'id' },
    )

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return res.status(400).json({
        success: false,
        message: profileError.message,
      })
    }

    return res.status(201).json({
      success: true,
      message: data.session
        ? 'Account created successfully.'
        : 'Account created. Check your email if confirmation is enabled.',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        access_token: data.session?.access_token ?? null,
        refresh_token: data.session?.refresh_token ?? null,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({
      success: false,
      message: 'The account could not be registered.',
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error || !data.user || !data.session) {
      return res.status(401).json({
        success: false,
        message: error?.message || 'Invalid email or password.',
      })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, email, initials, avatar_url, role, ban_type')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      return res.status(500).json({
        success: false,
        message: 'The user profile could not be loaded.',
      })
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: 'No application profile exists for this account.',
      })
    }

    if (profile.ban_type === 'full_ban') {
      return res.status(403).json({
        success: false,
        message: 'This account is suspended.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        profile,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      message: 'The login request could not be completed.',
    })
  }
}

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      profile: req.profile,
    },
  })
}
