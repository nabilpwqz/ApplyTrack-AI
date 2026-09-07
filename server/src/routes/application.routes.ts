import { Router } from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  addTimelineEvent,
  extractFromUrl
} from '../controllers/application.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/extract-url', extractFromUrl);

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

router.post('/:id/timeline', addTimelineEvent);

export default router;
