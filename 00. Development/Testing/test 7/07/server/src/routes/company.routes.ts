import { Router } from 'express';
import {
  getCompanies,
  getCompanyById,
  analyzeCompanyHealth
} from '../controllers/company.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post('/:id/analyze', analyzeCompanyHealth);

export default router;
