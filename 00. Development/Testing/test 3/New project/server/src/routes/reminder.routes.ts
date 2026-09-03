import { Router } from 'express';
import {
  getReminders,
  createReminder,
  toggleReminderComplete,
  deleteReminder
} from '../controllers/reminder.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getReminders)
  .post(createReminder);

router.patch('/:id/complete', toggleReminderComplete);
router.delete('/:id', deleteReminder);

export default router;
