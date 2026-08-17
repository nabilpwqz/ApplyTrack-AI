import express from 'express';
import {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
  addTimelineEvent,
} from '../controllers/application.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

router.route('/:id/timeline')
  .post(addTimelineEvent);

export default router;
