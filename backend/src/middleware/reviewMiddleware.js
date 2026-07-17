import supabase from '../config/supabase.js'

// Validate a new review
export const validateReviewCreate = (req, res, next) => {
  const { rating, comment, visited } = req.body

  const errors = []

  if (rating === undefined) {
    errors.push('Rating is required.')
  }

  if (
    rating !== undefined &&
    (!Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5)
  ) {
    errors.push('Rating must be an integer between 1 and 5.')
  }

  if (
    comment !== undefined &&
    comment !== null &&
    typeof comment !== 'string'
  ) {
    errors.push('Comment must be text.')
  }

  if (
    comment &&
    typeof comment === 'string' &&
    comment.length > 2000
  ) {
    errors.push('Comment cannot exceed 2000 characters.')
  }

  if (
    visited !== undefined &&
    typeof visited !== 'boolean'
  ) {
    errors.push('Visited must be true or false.')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Review validation failed.',
      errors,
    })
  }

  req.reviewPayload = {
    rating: Number(rating),
    comment:
      comment === undefined || comment === null
        ? null
        : comment.trim(),
    visited: visited ?? false,
  }

  return next()
}

// Validate an updated review
export const validateReviewUpdate = (req, res, next) => {
  const { rating, comment, visited } = req.body

  const errors = []
  const payload = {}

  if (rating !== undefined) {
    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      errors.push('Rating must be an integer between 1 and 5.')
    } else {
      payload.rating = Number(rating)
    }
  }

  if (comment !== undefined) {
    if (comment !== null && typeof comment !== 'string') {
      errors.push('Comment must be text.')
    } else if (
      typeof comment === 'string' &&
      comment.length > 2000
    ) {
      errors.push('Comment cannot exceed 2000 characters.')
    } else {
      payload.comment =
        comment === null ? null : comment.trim()
    }
  }

  if (visited !== undefined) {
    if (typeof visited !== 'boolean') {
      errors.push('Visited must be true or false.')
    } else {
      payload.visited = visited
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Review validation failed.',
      errors,
    })
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({
      success: false,
      message:
        'Provide rating, comment, or visited to update.',
    })
  }

  req.reviewPayload = payload

  return next()
}

// Prevent banned users from posting or editing reviews
export const ensureReviewPostingAllowed = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.profile?.id || req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required.',
      })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role, ban_type')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
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

    if (profile.ban_type === 'full_ban') {
      return res.status(403).json({
        success: false,
        message: 'This account is suspended.',
      })
    }

    if (profile.ban_type === 'comment_ban') {
      return res.status(403).json({
        success: false,
        message:
          'This account cannot create or edit reviews.',
      })
    }

    req.profile = profile

    return next()
  } catch (error) {
    console.error(
      'Review permission middleware error:',
      error,
    )

    return res.status(500).json({
      success: false,
      message: 'Review permission could not be checked.',
    })
  }
}

// Allow users to update or delete only their own review
export const loadReviewAndAuthorize = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.profile?.id || req.user?.id

    const { data: review, error } = await supabase
      .from('reviews')
      .select('id, user_id, destination_id')
      .eq('id', req.params.id)
      .maybeSingle()

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      })
    }

    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can modify only your own review.',
      })
    }

    req.review = review

    return next()
  } catch (error) {
    console.error(
      'Review ownership middleware error:',
      error,
    )

    return res.status(500).json({
      success: false,
      message: 'Review ownership could not be checked.',
    })
  }
}