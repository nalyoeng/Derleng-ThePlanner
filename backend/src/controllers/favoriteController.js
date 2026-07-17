import supabase from '../config/supabase.js';

const getUserId = (req) => {
  return req.profile?.id || req.user?.id;
};

const parseDestinationId = (value) => {
  const destinationId = Number(value);

  if (
    !Number.isInteger(destinationId) ||
    destinationId <= 0
  ) {
    return null;
  }

  return destinationId;
};


// GET /api/favorites
export const getMyFavorites = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        destination_id,
        created_at,
        destinations (
          id,
          name,
          location,
          categories,
          image_url,
          cost,
          rating,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const favorites = (data || [])
      .map((item) => ({
        destination_id: item.destination_id,
        created_at: item.created_at,
        destination: Array.isArray(
          item.destinations
        )
          ? item.destinations[0]
          : item.destinations,
      }))
      .filter((item) => item.destination);

    return res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error(
      'Get favorites error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Could not load favorite destinations.',
    });
  }
};

// POST /api/favorites/:destinationId
export const addFavorite = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    const destinationId = parseDestinationId(
      req.params.destinationId
    );

    if (!destinationId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID.',
      });
    }

    const {
      data: destination,
      error: destinationError,
    } = await supabase
      .from('destinations')
      .select('id, name')
      .eq('id', destinationId)
      .maybeSingle();

    if (destinationError) {
      return res.status(400).json({
        success: false,
        message: destinationError.message,
      });
    }

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found.',
      });
    }

    const { data, error } = await supabase
      .from('favorites')
      .upsert(
        {
          user_id: userId,
          destination_id: destinationId,
        },
        {
          onConflict:
            'user_id,destination_id',
        }
      )
      .select(`
        destination_id,
        created_at
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Destination saved.',
      data,
    });
  } catch (error) {
    console.error(
      'Add favorite error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Could not save destination.',
    });
  }
};

// DELETE /api/favorites/:destinationId
export const removeFavorite = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    const destinationId = parseDestinationId(
      req.params.destinationId
    );

    if (!destinationId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID.',
      });
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('destination_id', destinationId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Destination removed from favorites.',
    });
  } catch (error) {
    console.error(
      'Remove favorite error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Could not remove destination.',
    });
  }
};