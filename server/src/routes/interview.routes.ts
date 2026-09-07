import { Router } from 'express';
import { startOrContinueMockInterview } from '../controllers/interview.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/mock/chat', startOrContinueMockInterview);

export default router;
