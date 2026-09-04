import { Router } from 'express';
import {
  getPlaceReviews,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
} from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth';
import { uploadImage } from '../middlewares/upload';

const router = Router({ mergeParams: true });

router.get('/', getPlaceReviews);
router.post('/', authenticate, uploadImage.array('photos', 5), createReview);
router.patch('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/helpful', authenticate, voteHelpful);

export default router;
