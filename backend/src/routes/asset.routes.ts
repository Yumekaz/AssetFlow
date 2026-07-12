import { Router } from 'express';
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset } from '../controllers/asset.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All asset routes require authentication
router.use(authenticateJWT);

// View routes are available to everyone (scoping is done in controller)
router.get('/', getAssets);
router.get('/:id', getAssetById);

// Create, Update, Delete are restricted to Admin and Asset Manager
const requireAssetManager = requireRole(['Admin', 'Asset Manager']);

router.post('/', requireAssetManager, createAsset);
router.put('/:id', requireAssetManager, updateAsset);
router.delete('/:id', requireAssetManager, deleteAsset);

export default router;
