// routes/groupRoutes.js
import express from 'express';
import { getUserGroups, inviteUser } from '../controllers/groupController.js';

const router = express.Router();

router.get('/user/:userId', getUserGroups);
router.post('/invite', inviteUser);
router.get('/:groupId', getGroupById);
router.patch('/:groupId/schedule', updateGroupSchedule);

export default router;