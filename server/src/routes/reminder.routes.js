import express from 'express';
import { getReminders, createReminder, toggleReminderComplete, deleteReminder } from '../controllers/reminder.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReminders)
  .post(createReminder);

router.route('/:id/complete')
  .patch(toggleReminderComplete);

router.route('/:id')
  .delete(deleteReminder);

export default router;
