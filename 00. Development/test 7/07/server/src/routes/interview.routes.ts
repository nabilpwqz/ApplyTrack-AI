import { Router } from 'express';
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview
} from '../controllers/interview.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getInterviews)
  .post(createInterview);

router.route('/:id')
  .put(updateInterview)
  .delete(deleteInterview);

export default router;
