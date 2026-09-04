import { Router } from 'express';
import {
  generateTravelPlan,
  chatWithAI,
  chatStream,
  generateJournalStory,
} from '../controllers/ai.controller';
import { optionalAuthenticate } from '../middlewares/auth';
import { aiRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.use(optionalAuthenticate);
router.use(aiRateLimiter);

router.post('/plan', generateTravelPlan);
router.post('/chat', chatWithAI);
router.post('/chat/stream', chatStream);
router.post('/journal-story', generateJournalStory);

export default router;
