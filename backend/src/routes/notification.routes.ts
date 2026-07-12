import { Router } from 'express';
import { getNotifications, markAsRead, getActivityLogs } from '../controllers/notification.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

// Activity logs are strictly for Admins
router.get('/logs', requireRole(['Admin']), getActivityLogs);

export default router;
