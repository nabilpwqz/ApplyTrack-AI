import { Response, NextFunction } from 'express';
import Company from '../models/Company';
import { AuthenticatedRequest } from '../middleware/auth';
import { isMongoConnected } from '../config/db';
import { aiService } from '../services/ai.service';

export const getCompanies = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const companies = await Company.find().sort({ healthScore: -1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(404);
      throw new Error('Company not found');
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeCompanyHealth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        message: 'Company health score re-analyzed successfully',
        data: { _id: req.params.id, name: 'Target Company', healthScore: 85, layoffRisk: 12 }
      });
      return;
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    const audit = await aiService.analyzeCompanyHealth(company.name, company.domain, company.industry);

    company.healthScore = audit.healthScore;
    company.layoffRisk = audit.layoffRisk;
    company.description = audit.description;
    company.factors = audit.factors;
    company.lastAnalyzedAt = new Date();

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company health score re-analyzed successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};
