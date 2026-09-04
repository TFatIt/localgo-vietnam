import { Router } from 'express';
import { getBookmarks, toggleBookmark, getFavorites, toggleFavorite } from '../controllers/engagement.controller';
import { authenticate } from '../middlewares/auth';
import { checkIn, getMyCheckIns, getLeaderboard } from '../controllers/checkin.controller';

const router = Router();

router.use(authenticate);

// Bookmarks
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks/:placeId', toggleBookmark);
router.delete('/bookmarks/:placeId', toggleBookmark);

// Favorites
router.get('/favorites', getFavorites);
router.post('/favorites/:placeId', toggleFavorite);
router.delete('/favorites/:placeId', toggleFavorite);

// Check-ins
router.post('/checkins', checkIn);
router.get('/checkins', getMyCheckIns);
router.get('/leaderboard', getLeaderboard);

export default router;
