/**
 * Allows only the listed application roles.
 * Example: requireRoles('place_manager', 'super_admin')
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.profile?.role

    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'A user role is required.',
      })
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}.`,
      })
    }

    return next()
  }
}
