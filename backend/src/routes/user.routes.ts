import { Router } from 'express';
import { updateRole } from '../controllers/user.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.put('/:id/role', authenticateJWT, requireRole(['Admin']), updateRole);

export default router;

