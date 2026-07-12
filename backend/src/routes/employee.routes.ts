import { Router } from 'express';
import { getEmployees, promoteEmployee, assignDepartment } from '../controllers/employee.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Admin']));

router.get('/', getEmployees);
router.put('/:id/role', promoteEmployee);
router.put('/:id/department', assignDepartment);

export default router;
