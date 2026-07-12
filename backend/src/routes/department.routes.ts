import { Router } from 'express';
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from '../controllers/department.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Public route to list departments (needed for signup)
router.get('/', getDepartments);

// All other department routes require Admin access
router.use(authenticateJWT);
router.use(requireRole(['Admin']));

router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
