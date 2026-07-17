import express from 'express'
import {
  getDestinationById,
  listDestinations,
} from '../controllers/destinationController.js'

const router = express.Router()

// User-facing destination features
router.get('/', listDestinations)
router.get('/:id', getDestinationById)

export default router