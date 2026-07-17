import express from 'express';
import * as pollController from '../controllers/pollController.js'; 

const router = express.Router();

// GET /api/polls/:groupId -> Fetch all polls for a specific chat group room
router.get('/:groupId', pollController.getPollsByGroup);

// POST /api/polls -> Create a new group voting poll
router.post('/', pollController.createPoll);

export default router;