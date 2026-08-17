import express from 'express';
import { generateFollowUp, getInterviewPrep, analyzeOfferSalary, checkJobMatch } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/follow-up', generateFollowUp);
router.get('/interview-prep', getInterviewPrep);
router.post('/salary-analysis', analyzeOfferSalary);
router.post('/job-match', checkJobMatch);

export default router;
