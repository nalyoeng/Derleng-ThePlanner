import express from 'express';
import {getTripDaysByGroup, getActivitiesByDay, createActivity, deleteActivity} from '../controllers/tripController.js';

const router = express.Router();

router.get('/days/:groupId', getTripDaysByGroup);
router.get('/activities/:dayId', getActivitiesByDay);
router.post('/activities', createActivity);
router.delete('/activities/:activityId', deleteActivity);

export default router;