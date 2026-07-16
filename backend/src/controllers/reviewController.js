import supabase from '../config/supabase.js'

const MAX_PAGE_SIZE = 100
const MODERATION_ROLES = ['moderator', 'super_admin']

const parsePagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 10, 1),
    MAX_PAGE_SIZE,
  )
  const from = (page - 1) * limit
  const to = from + limit - 1
  return { page, limit, from, to }
}

const validateReview = (body, { partial = false } = {}) => {
  const errors = []

  if (!partial && body.rating === undefined) {
    errors.push('rating is required.')
  }

  if (body.rating !== undefined) {
    const rating = Number(body.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      errors.push('rating must be an integer between 1 and 5.')
    }
  }

  if (body.comment !== undefined && body.comment !== null) {
    if (typeof body.comment !== 'string') {
      errors.push('comment must be text.')
    } else if (body.comment.trim().length > 2000) {
      errors.push('comment cannot exceed 2000 characters.')
    }
  }

  if (body.visited !== undefined && typeof body.visited !== 'boolean') {
    errors.push('visited must be true or false.')
  }

  return errors
}

const mapReviewPayload = (body) => {
  const payload = {}

  if (body.rating !== undefined) payload.rating = Number(body.rating)
  if (body.comment !== undefined) {
    payload.comment = body.comment === null ? null : body.comment.trim()
  }
  if (body.visited !== undefined) payload.visited = body.visited

  return payload
}

const canModifyReview = (review, profile) =>
  review.user_id === profile.id || MODERATION_ROLES.includes(profile.role)
export const reportReview = async (req, res) => {
  try {
    const reviewId = req.params.id
    const reason = req.body?.reason?.trim()

    const reporterId =
      req.profile?.id || req.user?.id

    if (!reporterId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required.',
      })
    }

    const allowedReasons = [
      'Spam',
      'Harassment',
      'Hate speech',
      'Misinformation',
      'Illegal content',
      'Other',
    ]

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required.',
      })
    }

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report reason.',
      })
    }

    const {
      data: review,
      error: reviewError,
    } = await supabase
      .from('reviews')
      .select(`
        id,
        user_id,
        destination_id,
        comment
      `)
      .eq('id', reviewId)
      .maybeSingle()

    if (reviewError) {
      return res.status(400).json({
        success: false,
        message: reviewError.message,
      })
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      })
    }

    if (String(review.user_id) === String(reporterId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report your own review.',
      })
    }

    const reportContent =
      review.comment?.trim() ||
      `Review ${review.id} on destination ${review.destination_id}`

    const {
      data: report,
      error: reportError,
    } = await supabase
      .from('reports')
      .insert({
        reported_user_id: review.user_id,
        reported_by_id: reporterId,
        content: reportContent,
        reason,
        status: 'Pending',
      })
      .select()
      .single()

    if (reportError) {
      console.error(
        'Create report database error:',
        reportError
      )

      return res.status(400).json({
        success: false,
        message: reportError.message,
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Review reported successfully.',
      data: report,
    })
  } catch (error) {
    console.error('Report review error:', error)

    return res.status(500).json({
      success: false,
      message: 'Could not report this review.',
    })
  }
}
export const listReviewsForDestination = async (req, res) => {
  try {
    const { page, limit, from, to } = parsePagination(req.query)

    const { data, error, count } = await supabase
      .from('reviews')
      .select(
        `
          id,
          destination_id,
          user_id,
          rating,
          comment,
          visited,
          helpful_count,
          created_at,
          updated_at,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `,
        { count: 'exact' },
      )
      .eq('destination_id', req.params.destinationId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count ?? data.length,
        total_pages: Math.ceil((count ?? data.length) / limit),
      },
    })
  } catch (error) {
    console.error('List reviews error:', error)
    return res.status(500).json({
      success: false,
      message: 'Reviews could not be loaded.',
    })
  }
}

export const getReviewById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        destination_id,
        user_id,
        rating,
        comment,
        visited,
        helpful_count,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', req.params.id)
      .maybeSingle()

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Review not found.' })
    }

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('Get review error:', error)
    return res.status(500).json({
      success: false,
      message: 'The review could not be loaded.',
    })
  }
}

export const createReview = async (req, res) => {
  try {
    if (req.profile.ban_type === 'comment_ban') {
      return res.status(403).json({
        success: false,
        message: 'This account is not allowed to post reviews.',
      })
    }

    const errors = validateReview(req.body)
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Review validation failed.',
        errors,
      })
    }

    const { data: destination, error: destinationError } = await supabase
      .from('destinations')
      .select('id')
      .eq('id', req.params.destinationId)
      .maybeSingle()

    if (destinationError) {
      return res.status(400).json({
        success: false,
        message: destinationError.message,
      })
    }

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      })
    }

    const payload = {
      destination_id: req.params.destinationId,
      user_id: req.profile.id,
      ...mapReviewPayload(req.body),
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(payload)
      .select('*')
      .single()

    if (error?.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this destination.',
      })
    }

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(201).json({
      success: true,
      message: 'Review created successfully.',
      data,
    })
  } catch (error) {
    console.error('Create review error:', error)
    return res.status(500).json({
      success: false,
      message: 'The review could not be created.',
    })
  }
}

export const updateReview = async (req, res) => {
  try {
    if (req.profile.ban_type === 'comment_ban' && !MODERATION_ROLES.includes(req.profile.role)) {
      return res.status(403).json({
        success: false,
        message: 'This account is not allowed to edit reviews.',
      })
    }

    const errors = validateReview(req.body, { partial: true })
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Review validation failed.',
        errors,
      })
    }

    const payload = mapReviewPayload(req.body)
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide rating, comment, or visited to update.',
      })
    }

    const { data: currentReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', req.params.id)
      .maybeSingle()

    if (fetchError) {
      return res.status(400).json({ success: false, message: fetchError.message })
    }

    if (!currentReview) {
      return res.status(404).json({ success: false, message: 'Review not found.' })
    }

    if (!canModifyReview(currentReview, req.profile)) {
      return res.status(403).json({
        success: false,
        message: 'You can update only your own review.',
      })
    }

    payload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('reviews')
      .update(payload)
      .eq('id', req.params.id)
      .select('*')
      .single()

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data,
    })
  } catch (error) {
    console.error('Update review error:', error)
    return res.status(500).json({
      success: false,
      message: 'The review could not be updated.',
    })
  }
}

export const deleteReview = async (req, res) => {
  try {
    const { data: currentReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', req.params.id)
      .maybeSingle()

    if (fetchError) {
      return res.status(400).json({ success: false, message: fetchError.message })
    }

    if (!currentReview) {
      return res.status(404).json({ success: false, message: 'Review not found.' })
    }

    if (!canModifyReview(currentReview, req.profile)) {
      return res.status(403).json({
        success: false,
        message: 'You can delete only your own review.',
      })
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', req.params.id)

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
      data: currentReview,
    })
  } catch (error) {
    console.error('Delete review error:', error)
    return res.status(500).json({
      success: false,
      message: 'The review could not be deleted.',
    })
  }
}
