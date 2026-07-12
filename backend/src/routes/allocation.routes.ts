import { Router } from 'express';
import { allocateAsset, returnAsset, getAllocations, requestTransfer, approveTransfer, rejectTransfer, getTransferRequests } from '../controllers/allocation.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllocations);
router.get('/transfers', getTransferRequests);

const requireAssetManager = requireRole(['Admin', 'Asset Manager']);
const requireTransferApprover = requireRole(['Admin', 'Asset Manager', 'Department Head']);
router.post('/', requireAssetManager, allocateAsset);
router.post('/transfer', requestTransfer);
router.post('/transfer/:id/approve', requireTransferApprover, approveTransfer);
router.post('/transfer/:id/reject', requireTransferApprover, rejectTransfer);
router.post('/:id/return', requireAssetManager, returnAsset);

export default router;
