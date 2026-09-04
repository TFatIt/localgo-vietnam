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
  getSiteSettings,
  updateSiteSettings,
  adminCreatePlace,
  adminUpdatePlace,
  adminDeletePlace,
  getAdminReviews,
  deleteAdminReview,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// CMS & Giao diện (DulichViet Style)
router.get('/settings', getSiteSettings);
router.put('/settings', updateSiteSettings);

// Users
router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);

// Places & Tours
router.get('/places', getAdminPlaces);
router.post('/places', adminCreatePlace);
router.put('/places/:id', adminUpdatePlace);
router.delete('/places/:id', adminDeletePlace);
router.patch('/places/:id/verify', verifyPlace);

// Reviews
router.get('/reviews', getAdminReviews);
router.delete('/reviews/:id', deleteAdminReview);

// Reports
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);

export default router;

