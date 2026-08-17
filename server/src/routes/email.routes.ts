import { Router } from 'express';
import {
  syncEmails,
  getEmailEvents,
  processEmailEvent
} from '../controllers/email.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/sync', syncEmails);
router.get('/events', getEmailEvents);
router.post('/events/:id/process', processEmailEvent);

export default router;
