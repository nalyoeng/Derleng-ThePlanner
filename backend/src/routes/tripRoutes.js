import express from 'express';
import * as tripController from '../controllers/tripController.js';

const router = express.Router();

// GET /api/trips/days/:groupId -> Fetch scheduling headers matching group
router.get('/days/:groupId', tripController.getTripDaysByGroup);

// GET /api/trips/activities/:dayId -> Fetch targeted daily itinerary lists
router.get('/activities/:dayId', tripController.getActivitiesByDay);

// POST /api/trips/activities -> Add travel cards (Transport, Stays, Dinings)
router.post('/activities', tripController.createActivity);

export default router;