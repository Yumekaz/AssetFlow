import { Router } from 'express';
import { raiseRequest, approveRequest, resolveRequest, getRequests } from '../controllers/maintenance.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getRequests);
router.post('/', raiseRequest);

const requireManager = requireRole(['Admin', 'Asset Manager']);
router.put('/:id/approve', requireManager, approveRequest);
router.put('/:id/resolve', requireManager, resolveRequest);

export default router;
