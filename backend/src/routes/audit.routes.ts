import { Router } from 'express';
import { startAudit, scanAssets, closeAudit, getAudits } from '../controllers/audit.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Admin', 'Asset Manager']));

router.get('/', getAudits);
router.post('/', startAudit);
router.post('/:id/scan', scanAssets);
router.put('/:id/close', closeAudit);

export default router;
