import Company from '../models/Company.js';
import Application from '../models/Application.js';
import { aiService } from '../services/ai.service.js';

// Get list of all companies associated with user's applications
export const getCompanies = async (req, res, next) => {
  try {
    const userApplications = await Application.find({ userId: req.user.id }).distinct('companyId');
    const companies = await Company.find({ _id: { $in: userApplications } });

    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// Get single company by ID
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// Re-run AI Company Health Analysis
export const reAnalyzeCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    // Call AI service
    const analysis = await aiService.analyzeCompanyHealth(company.name, company.domain);

    // Update company doc
    company.healthScore = analysis.healthScore;
    company.layoffRisk = analysis.layoffRisk;
    company.factors = analysis.factors;
    company.description = analysis.description;
    company.website = analysis.website;
    company.size = analysis.size;
    company.industry = analysis.industry;
    company.foundedYear = analysis.foundedYear;
    company.lastAnalyzedAt = new Date();

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company health score re-analyzed successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};
