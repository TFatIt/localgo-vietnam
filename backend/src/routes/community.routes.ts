import { Router } from 'express';
import {
  getFeed,
  createPost,
  deletePost,
  toggleLikePost,
  getComments,
  createComment,
} from '../controllers/community.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';
import { uploadImage } from '../middlewares/upload';

const router = Router();

// Posts
router.get('/feed', optionalAuthenticate, getFeed);
router.post('/', authenticate, uploadImage.array('media', 10), createPost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, toggleLikePost);

// Comments
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', authenticate, createComment);

export default router;
