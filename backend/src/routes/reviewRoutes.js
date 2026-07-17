import express from 'express'

import {
  listReviewsForDestination,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  reportReview,
} from '../controllers/reviewController.js'

import {
  protect,
} from '../middleware/authMiddleware.js'

import {
  loadRestrictions,
  blockFullBan,
  blockCommentBan,
  blockRestrictedWrite,
} from '../middleware/restrictionMiddleware.js'

const router = express.Router()

// Public: load reviews for one destination
router.get(
  '/destination/:destinationId',
  listReviewsForDestination
)

// Public: load one review
router.get(
  '/:id',
  getReviewById
)

// Protected: create a review
router.post(
  '/destination/:destinationId',
  protect,
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
  blockCommentBan,
  createReview
)

// Protected: update own review
router.patch(
  '/:id',
  protect,
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
  blockCommentBan,
  updateReview
)

// Protected: delete own review
router.delete(
  '/:id',
  protect,
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
  deleteReview
)

// Protected: report another review
router.post(
  '/:id/report',
  protect,
  loadRestrictions,
  blockFullBan,
  blockRestrictedWrite,
  reportReview
)

export default router