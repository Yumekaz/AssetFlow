import { Router } from 'express';
import { createBooking, approveBooking, rejectBooking, getBookings } from '../controllers/booking.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getBookings);
router.post('/', createBooking);

const requireApprover = requireRole(['Admin', 'Department Head']);
router.put('/:id/approve', requireApprover, approveBooking);
router.put('/:id/reject', requireApprover, rejectBooking);

export default router;
