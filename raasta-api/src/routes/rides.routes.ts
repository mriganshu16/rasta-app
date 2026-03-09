import express from 'express';
import { startRide, updateRide, completeRide, getMyRides } from '../controllers/rides.controller';
import { protect } from '../common/middlewares/auth.middleware';

const router = express.Router();

router.route('/')
  .post(protect, startRide)
  .get(protect, getMyRides);

router.route('/:id')
  .put(protect, updateRide);

router.post('/:id/complete', protect, completeRide);

export default router;
