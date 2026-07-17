// backend/src/routes/friendRoutes.js
import express from 'express';
import * as friendController from '../controllers/friendController.js';
import { protect } from '../middleware/authMiddleware.js'; // Protects the routes

const router = express.Router();

// Passing 'protect' as the second argument forces authentication validation first!
router.get('/my-list', protect, friendController.getMyFriends);
router.post('/request', protect, friendController.sendFriendRequest);

export default router;