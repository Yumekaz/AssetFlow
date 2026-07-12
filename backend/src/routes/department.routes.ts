import { Router } from 'express';
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from '../controllers/department.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All department routes require Admin access
router.use(authenticateJWT);
router.use(requireRole(['Admin']));

router.post('/', createDepartment);
router.get('/', getDepartments);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
