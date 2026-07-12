import { Router } from 'express';
import { allocateAsset, returnAsset, getAllocations, requestTransfer } from '../controllers/allocation.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllocations);

const requireAssetManager = requireRole(['Admin', 'Asset Manager', 'Department Head']);
router.post('/', requireAssetManager, allocateAsset);
router.post('/transfer', requireAssetManager, requestTransfer);
router.post('/:id/return', requireAssetManager, returnAsset);

export default router;
