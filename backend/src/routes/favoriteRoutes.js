import express from 'express'

import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from '../controllers/favoriteController.js'

import {
  protect,
} from '../middleware/authMiddleware.js'

import {
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
} from '../middleware/restrictionMiddleware.js'

const router = express.Router()

// View own favorites
router.get(
  '/',
  protect,
  loadRestrictions,
  blockFullBan,
  getMyFavorites
)

// Add favorite
router.post(
  '/:destinationId',
  protect,
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
  addFavorite
)

// Remove favorite
router.delete(
  '/:destinationId',
  protect,
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
  removeFavorite
)

export default router