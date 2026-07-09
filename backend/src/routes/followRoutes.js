import express from 'express';
import { toggleFollow, searchUsers } from '../controllers/followController.js';
import { protect } from '../middleware/authMiddleware.js'; // Ensure .js is included if this is a local file

const router = express.Router();

// POST /api/follow/toggle -> Follow or Unfollow a user
router.post('/toggle', protect, toggleFollow);

// GET /api/follow/search?username=dara
router.get('/search', protect, searchUsers);

export default router;