import { Router } from 'express';
import {
  getReminders,
  createReminder,
  toggleReminderComplete,
  dismissReminder,
  deleteReminder
} from '../controllers/reminder.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getReminders)
  .post(createReminder);

router.patch('/:id/complete', toggleReminderComplete);
router.patch('/:id/dismiss', dismissReminder);
router.delete('/:id', deleteReminder);

export default router;