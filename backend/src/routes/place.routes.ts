import { Router } from 'express';
import {
  getPlaces,
  getPlaceById,
  getNearbyPlaces,
  getTrending,
  getHiddenGems,
  createPlace,
  updatePlace,
} from '../controllers/place.controller';
import { authenticate, optionalAuthenticate, authorize } from '../middlewares/auth';
import { uploadImage } from '../middlewares/upload';

const router = Router();

// Public / optional auth
router.get('/', optionalAuthenticate, getPlaces);
router.get('/trending', getTrending);
router.get('/hidden-gems', getHiddenGems);
router.get('/nearby', getNearbyPlaces);
router.get('/:id', optionalAuthenticate, getPlaceById);

// Protected
router.post('/', authenticate, authorize('admin', 'business'), uploadImage.array('images', 10), createPlace);
router.patch('/:id', authenticate, updatePlace);

export default router;
