import express from 'express';
import { getInterviews, createInterview, updateInterview, deleteInterview } from '../controllers/interview.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInterviews)
  .post(createInterview);

router.route('/:id')
  .put(updateInterview)
  .delete(deleteInterview);

export default router;
