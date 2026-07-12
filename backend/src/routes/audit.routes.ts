import { Router } from 'express';
import { startAudit, scanAssets, closeAudit, getAudits } from '../controllers/audit.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAudits);
router.post('/', requireRole(['Admin']), startAudit);
router.post('/:id/scan', scanAssets);
router.put('/:id/close', requireRole(['Admin']), closeAudit);

export default router;
