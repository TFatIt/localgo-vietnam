import { Router } from 'express';
import {
  getDashboardStats,
  getAdminUsers,
  updateUserRole,
  toggleUserStatus,
  getAdminPlaces,
  verifyPlace,
  getReports,
  resolveReport,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/places', getAdminPlaces);
router.patch('/places/:id/verify', verifyPlace);
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);

export default router;
