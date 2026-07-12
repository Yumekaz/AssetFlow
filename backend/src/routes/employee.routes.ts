import { Router } from 'express';
import { getEmployees, promoteEmployee, assignDepartment } from '../controllers/employee.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', requireRole(['Admin', 'Asset Manager']), getEmployees);
router.put('/:id/role', requireRole(['Admin']), promoteEmployee);
router.put('/:id/department', requireRole(['Admin']), assignDepartment);

export default router;
