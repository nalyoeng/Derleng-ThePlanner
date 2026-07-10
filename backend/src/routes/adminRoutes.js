import express from 'express';
import {
  // Dashboard
  getAllUsers,
  // Create admin & revoke
  createAdmin,
  revokeAdmin,
  editAdminRole,
  // Destinations
  getAllDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  // Reports
  getAllReports,
  dismissReport,
  // Ban & restrictions
  banUser,
  restrictUser,
  liftRestriction,
  getAllRestrictions,
} from '../controllers/adminController.js';

import {
  isAuthenticated,
  isSuperAdmin,
  isAdmin,
  isModerator,
  isPlaceManager,
} from '../middleware/adminMiddleware.js';

const router = express.Router();

// ── All admin routes require authentication ──────────────────
router.use(isAuthenticated);

// ── Dashboard ────────────────────────────────────────────────
// GET /api/admin/users
router.get('/users', isSuperAdmin, getAllUsers);

// ── Create Admin & Revoke ────────────────────────────────────
// POST /api/admin/create
router.post('/create', isSuperAdmin, createAdmin);

// PATCH /api/admin/revoke/:id
router.patch('/revoke/:id', isSuperAdmin, revokeAdmin);

// PATCH /api/admin/edit-role/:id
router.patch('/edit-role/:id', isSuperAdmin, editAdminRole);

// ── Destinations ─────────────────────────────────────────────
// GET /api/admin/destinations
router.get('/destinations', isAdmin, getAllDestinations);

// POST /api/admin/destinations
router.post('/destinations', isPlaceManager, createDestination);

// PUT /api/admin/destinations/:id
router.put('/destinations/:id', isPlaceManager, updateDestination);

// DELETE /api/admin/destinations/:id
router.delete('/destinations/:id', isSuperAdmin, deleteDestination);

// ── Reports ──────────────────────────────────────────────────
// GET /api/admin/reports
router.get('/reports', isModerator, getAllReports);

// PATCH /api/admin/reports/:id/dismiss
router.patch('/reports/:id/dismiss', isModerator, dismissReport);

// ── Ban & Restrictions ───────────────────────────────────────
// PATCH /api/admin/ban/:id
router.patch('/ban/:id', isModerator, banUser);

// POST /api/admin/restrict/:id
router.post('/restrict/:id', isModerator, restrictUser);

// PATCH /api/admin/lift/:id
router.patch('/lift/:id', isModerator, liftRestriction);

// GET /api/admin/restrictions
router.get('/restrictions', isModerator, getAllRestrictions);

export default router;