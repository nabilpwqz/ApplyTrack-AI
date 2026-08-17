import { Router } from 'express';
import { getAnalyticsSummary } from '../controllers/analytics.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getAnalyticsSummary);

export default router;
