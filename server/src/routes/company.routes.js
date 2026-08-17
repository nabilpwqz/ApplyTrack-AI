import express from 'express';
import { getCompanies, getCompanyById, reAnalyzeCompany } from '../controllers/company.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCompanies);

router.route('/:id')
  .get(getCompanyById);

router.route('/:id/analyze')
  .post(reAnalyzeCompany);

export default router;
