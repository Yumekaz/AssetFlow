import { Router } from 'express';
import { getDashboardKPIs } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.get('/', getDashboardKPIs);

export default router;
