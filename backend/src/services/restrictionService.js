import supabase from '../config/supabase.js';

export const getActiveRestrictions = async (userId) => {
  const { data, error } = await supabase
    .from('restrictions')
    .select(`
      id,
      user_id,
      type,
      reason,
      restricted_until,
      is_active,
      created_by,
      report_id,
      created_at
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const now = new Date();

  const expiredIds = [];
  const activeRestrictions = [];

  for (const restriction of data || []) {
    const hasExpired =
      restriction.restricted_until &&
      new Date(restriction.restricted_until) <= now;

    if (hasExpired) {
      expiredIds.push(restriction.id);
    } else {
      activeRestrictions.push(restriction);
    }
  }

  // Automatically deactivate expired restrictions.
  if (expiredIds.length > 0) {
    const { error: updateError } = await supabase
      .from('restrictions')
      .update({
        is_active: false,
      })
      .in('id', expiredIds);

    if (updateError) {
      console.error(
        'Could not deactivate expired restrictions:',
        updateError
      );
    }
  }

  return activeRestrictions;
};