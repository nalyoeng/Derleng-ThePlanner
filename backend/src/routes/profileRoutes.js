import express from 'express'

import {
  getMyProfile,
  updateMyProfile,
} from '../controllers/profileController.js'

import {
  protect,
} from '../middleware/authMiddleware.js'

import {
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
} from '../middleware/restrictionMiddleware.js'

const router = express.Router()

// Full-banned user cannot access profile
router.get(
  '/me',
  protect,
  loadRestrictions,
  blockFullBan,
  getMyProfile
)

// Restricted account can view profile,
// but cannot update it
router.patch(
  '/me',
  protect,
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
  updateMyProfile
)

export default router