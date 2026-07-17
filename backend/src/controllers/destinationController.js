import supabase from '../config/supabase.js'

const ALLOWED_STATUSES = ['Active', 'Offline']
const MAX_PAGE_SIZE = 100

const parsePagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 12, 1),
    MAX_PAGE_SIZE,
  )
  const from = (page - 1) * limit
  const to = from + limit - 1
  return { page, limit, from, to }
}

const validateDestination = (body, { partial = false } = {}) => {
  const errors = []
  const required = ['name', 'location', 'categories', 'cost']

  if (!partial) {
    required.forEach((field) => {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        errors.push(`${field} is required.`)
      }
    })
  }

  if (body.name !== undefined && !String(body.name).trim()) {
    errors.push('name cannot be empty.')
  }

  if (body.location !== undefined && !String(body.location).trim()) {
    errors.push('location cannot be empty.')
  }

  if (body.categories !== undefined) {
    if (!Array.isArray(body.categories) || body.categories.length === 0) {
      errors.push('categories must be a non-empty array.')
    }
  }

  if (body.status !== undefined && !ALLOWED_STATUSES.includes(body.status)) {
    errors.push('status must be Active or Offline.')
  }

  if (body.cost !== undefined) {
    const cost = Number(body.cost)
    if (!Number.isFinite(cost) || cost <= 0) {
      errors.push('cost must be a number greater than 0.')
    }
  }

  if (body.rating !== undefined) {
    const rating = Number(body.rating)
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      errors.push('rating must be between 0 and 5.')
    }
  }

  return errors
}

const mapDestinationPayload = (body) => {
  const payload = {}
  const allowedFields = [
    'name',
    'location',
    'categories',
    'status',
    'cost',
    'image_url',
    'rating',
  ]

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field]
    }
  })

  if (payload.name !== undefined) payload.name = String(payload.name).trim()
  if (payload.location !== undefined) payload.location = String(payload.location).trim()
  if (payload.categories !== undefined) {
    payload.categories = payload.categories.map((item) => String(item).trim()).filter(Boolean)
  }
  if (payload.cost !== undefined) payload.cost = Number(payload.cost)
  if (payload.rating !== undefined) payload.rating = Number(payload.rating)

  return payload
}

export const listDestinations = async (req, res) => {
  try {
    const { page, limit, from, to } = parsePagination(req.query)
    const { search, status, category } = req.query

    let query = supabase
      .from('destinations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) query = query.eq('status', status)
    if (category) query = query.contains('categories', [category])
    if (search?.trim()) {
      const term = search.trim().replaceAll(',', ' ')
      query = query.or(`name.ilike.%${term}%,location.ilike.%${term}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
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
    console.error('List destinations error:', error)
    return res.status(500).json({
      success: false,
      message: 'Destinations could not be loaded.',
    })
  }
}

export const getDestinationById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle()

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      })
    }

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('Get destination error:', error)
    return res.status(500).json({
      success: false,
      message: 'The destination could not be loaded.',
    })
  }
}

export const createDestination = async (req, res) => {
  try {
    const errors = validateDestination(req.body)

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Destination validation failed.',
        errors,
      })
    }

    const payload = mapDestinationPayload(req.body)
    payload.status = payload.status || 'Active'
    payload.created_by = req.profile.id

    const { data, error } = await supabase
      .from('destinations')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(201).json({
      success: true,
      message: 'Destination created successfully.',
      data,
    })
  } catch (error) {
    console.error('Create destination error:', error)
    return res.status(500).json({
      success: false,
      message: 'The destination could not be created.',
    })
  }
}

export const updateDestination = async (req, res) => {
  try {
    const errors = validateDestination(req.body, { partial: true })

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Destination validation failed.',
        errors,
      })
    }

    const payload = mapDestinationPayload(req.body)

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one destination field to update.',
      })
    }

    payload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('destinations')
      .update(payload)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle()

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Destination updated successfully.',
      data,
    })
  } catch (error) {
    console.error('Update destination error:', error)
    return res.status(500).json({
      success: false,
      message: 'The destination could not be updated.',
    })
  }
}

export const deleteDestination = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', req.params.id)
      .select('id, name')
      .maybeSingle()

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Destination deleted successfully.',
      data,
    })
  } catch (error) {
    console.error('Delete destination error:', error)
    return res.status(500).json({
      success: false,
      message: 'The destination could not be deleted.',
    })
  }
}
