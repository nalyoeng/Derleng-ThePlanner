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
  // Backup & Recover
  createBackup,
  getBackups,
  restoreBackup,
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
router.get('/users', isSuperAdmin, getAllUsers);

// ── Create Admin & Revoke ────────────────────────────────────
router.post('/create', isSuperAdmin, createAdmin);
router.patch('/revoke/:id', isSuperAdmin, revokeAdmin);
router.patch('/edit-role/:id', isSuperAdmin, editAdminRole);

// ── Destinations ─────────────────────────────────────────────
router.get('/destinations', isAdmin, getAllDestinations);
router.post('/destinations', isPlaceManager, createDestination);
router.put('/destinations/:id', isPlaceManager, updateDestination);
router.delete('/destinations/:id', isSuperAdmin, deleteDestination);

// ── Reports ──────────────────────────────────────────────────
router.get('/reports', isModerator, getAllReports);
router.patch('/reports/:id/dismiss', isModerator, dismissReport);

// ── Ban & Restrictions ───────────────────────────────────────
router.patch('/ban/:id', isModerator, banUser);
router.post('/restrict/:id', isModerator, restrictUser);
router.patch('/lift/:id', isModerator, liftRestriction);
router.get('/restrictions', isModerator, getAllRestrictions);

// ── Backup & Recover ─────────────────────────────────────────
router.post('/backup', isSuperAdmin, createBackup);
router.get('/backups', isSuperAdmin, getBackups);
router.post('/recover', isSuperAdmin, restoreBackup);

export default router;