// routes/groupRoutes.js
import express from 'express';
import { getUserGroups, inviteUser } from '../controllers/groupController.js';

const router = express.Router();

// 💡 These stay completely identical!
router.get('/user/:userId', getUserGroups);
router.post('/invite', inviteUser);

export default router;