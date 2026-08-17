import { Router } from 'express';
import {
  generateFollowUpEmail,
  getInterviewPrep,
  analyzeSalary,
  checkJobMatch
} from '../controllers/ai.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/follow-up', generateFollowUpEmail);
router.get('/interview-prep', getInterviewPrep);
router.post('/salary-analysis', analyzeSalary);
router.post('/job-match', checkJobMatch);

export default router;
