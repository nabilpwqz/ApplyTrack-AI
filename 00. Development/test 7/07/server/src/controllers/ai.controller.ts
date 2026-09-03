import { Response, NextFunction } from 'express';
import Application from '../models/Application';
import User from '../models/User';
import AIAnalysis from '../models/AIAnalysis';
import { AuthenticatedRequest } from '../middleware/auth';
import { isMongoConnected } from '../config/db';
import { aiService } from '../services/ai.service';

export const generateFollowUpEmail = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId, tone, customInfo } = req.body;

    if (!applicationId) {
      res.status(400);
      throw new Error('Application ID is required');
    }

    let companyName = 'Company';
    let jobTitle = 'Software Engineer';
    let daysSinceLastContact = 10;
    let candidateName = 'Guest';

    if (isMongoConnected) {
      const app = await Application.findOne({ _id: applicationId, userId: req.user!.id }).populate('companyId');
      const user = await User.findById(req.user!.id);
      if (app) {
        companyName = (app.companyId as any)?.name || app.companyName || 'Company';
        jobTitle = app.jobTitle;
        const diffTime = Math.abs(Date.now() - new Date(app.lastActivityAt).getTime());
        daysSinceLastContact = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      if (user) candidateName = user.name;
    }

    const emailDraft = await aiService.generateFollowUpEmail({
      candidateName,
      companyName,
      jobTitle,
      daysSinceLastContact,
      tone: tone || 'Professional',
      customInfo
    });

    if (isMongoConnected) {
      await AIAnalysis.create({
        applicationId,
        userId: req.user!.id,
        type: 'EMAIL_DRAFT',
        result: emailDraft.subject,
        payload: emailDraft
      });
    }

    res.status(200).json({
      success: true,
      message: 'Follow-up email generated',
      data: emailDraft
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewPrep = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applicationId = req.query.applicationId as string;

    let companyName = 'Company';
    let jobTitle = 'Frontend Engineer';

    if (isMongoConnected && applicationId) {
      const app = await Application.findOne({ _id: applicationId, userId: req.user!.id }).populate('companyId');
      if (app) {
        companyName = (app.companyId as any)?.name || app.companyName || 'Company';
        jobTitle = app.jobTitle;
      }
    }

    const prep = await aiService.calculateInterviewProbability({
      candidateProfile: { skills: ['React', 'TypeScript', 'Node.js'] },
      jobTitle,
      companyName
    });

    res.status(200).json({
      success: true,
      data: prep
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeSalary = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { offerAmount, role, location, experienceLevel } = req.body;

    if (!offerAmount || !role) {
      res.status(400);
      throw new Error('Offer Amount and Role Title are required');
    }

    const salaryAnalysis = await aiService.analyzeSalary({
      offerAmount: Number(offerAmount),
      role,
      location: location || 'Remote',
      experienceLevel: experienceLevel || 'JUNIOR'
    });

    res.status(200).json({
      success: true,
      message: 'Salary benchmarking evaluation generated',
      data: salaryAnalysis
    });
  } catch (error) {
    next(error);
  }
};

export const checkJobMatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobTitle, companyName, description } = req.body;

    if (!jobTitle || !description) {
      res.status(400);
      throw new Error('Job Title and Job Description are required');
    }

    const candidateProfile = { skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB'] };

    const matchAnalysis = await aiService.calculateInterviewProbability({
      candidateProfile,
      jobTitle,
      companyName: companyName || 'Target Company',
      jobDescription: description
    });

    res.status(200).json({
      success: true,
      message: 'Job match evaluation completed',
      data: {
        matchScore: matchAnalysis.score,
        result: matchAnalysis.result,
        factors: matchAnalysis.factors,
        recommendations: matchAnalysis.recommendations,
        missingSkills: ['Docker', 'AWS', 'Redis']
      }
    });
  } catch (error) {
    next(error);
  }
};
