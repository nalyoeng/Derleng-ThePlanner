import express from 'express'

import {
  createReview,
  deleteReview,
  getReviewById,
  listReviewsForDestination,
  updateReview,
  reportReview,
} from '../controllers/reviewController.js'

import { protect } from '../middleware/authMiddleware.js'

import {
  ensureReviewPostingAllowed,
  loadReviewAndAuthorize,
  validateReviewCreate,
  validateReviewUpdate,
} from '../middleware/reviewMiddleware.js'

const router = express.Router()

// Public routes
router.get(
  '/destination/:destinationId',
  listReviewsForDestination,
)

router.get('/:id', getReviewById)

// User creates a review
router.post(
  '/destination/:destinationId',
  protect,
  ensureReviewPostingAllowed,
  validateReviewCreate,
  createReview,
)
// user reports a review
router.post(
  '/:id/report',
  protect,
  reportReview,
)
// User updates their own review
router.patch(
  '/:id',
  protect,
  ensureReviewPostingAllowed,
  loadReviewAndAuthorize,
  validateReviewUpdate,
  updateReview,
)

// User deletes their own review
router.delete(
  '/:id',
  protect,
  loadReviewAndAuthorize,
  deleteReview,
)

export default router