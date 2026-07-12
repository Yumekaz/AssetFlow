import { Router } from 'express';
import { updateRole } from '../controllers/user.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.put('/:id/role', authenticate, authorizeRoles('Admin'), updateRole);

export default router;
