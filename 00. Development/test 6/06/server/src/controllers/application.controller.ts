import { Response, NextFunction } from 'express';
import Application from '../models/Application';
import Company from '../models/Company';
import AIAnalysis from '../models/AIAnalysis';
import { AuthenticatedRequest } from '../middleware/auth';
import { isMongoConnected } from '../config/db';
import { aiService } from '../services/ai.service';

export const getApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const { status, priority, search, sortBy } = req.query;

    const filter: any = { userId: req.user!.id };
    if (status && status !== 'ALL') filter.status = status;
    if (priority && priority !== 'ALL') filter.priority = priority;
    if (search) {
      filter.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    let sort: any = { applicationDate: -1 };
    if (sortBy === 'salary') sort = { 'salary.max': -1 };
    if (sortBy === 'updatedAt') sort = { lastActivityAt: -1 };

    const applications = await Application.find(filter)
      .populate('companyId')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(404);
      throw new Error('Application not found');
    }

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user!.id
    }).populate('companyId');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    const aiAnalyses = await AIAnalysis.find({ applicationId: application._id });

    res.status(200).json({
      success: true,
      data: {
        application,
        aiAnalyses
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobTitle, companyName, status, priority, location, workMode, salary, source, notes } = req.body;

    if (!jobTitle || !companyName) {
      res.status(400);
      throw new Error('Job Title and Company Name are required');
    }

    if (!isMongoConnected) {
      res.status(201).json({
        success: true,
        message: 'Application logged successfully',
        data: { _id: 'app_' + Date.now(), ...req.body, applicationDate: new Date() }
      });
      return;
    }

    let company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
    if (!company) {
      company = await Company.create({
        name: companyName,
        industry: 'Technology',
        healthScore: 80,
        layoffRisk: 15
      });
    }

    const application = await Application.create({
      userId: req.user!.id,
      jobTitle,
      companyId: company._id,
      companyName: company.name,
      status: status || 'APPLIED',
      priority: priority || 'MEDIUM',
      location: location || 'Remote',
      workMode: workMode || 'REMOTE',
      salary,
      source: source || 'Website',
      notes: notes || '',
      applicationDate: new Date(),
      lastActivityAt: new Date(),
      timeline: [
        {
          type: 'CREATION',
          title: 'Application Created',
          description: `Logged job application for ${jobTitle} at ${companyName}`,
          occurredAt: new Date()
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Application updated' });
      return;
    }

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    const { status, priority, notes, contacts } = req.body;

    if (status && status !== application.status) {
      application.timeline.push({
        type: 'STATUS_CHANGE',
        title: `Status changed to ${status}`,
        description: `Stage updated from ${application.status} to ${status}`,
        occurredAt: new Date()
      });
      application.status = status;
      application.lastActivityAt = new Date();
    }

    if (priority) application.priority = priority;
    if (notes !== undefined) application.notes = notes;
    if (contacts) application.contacts = contacts;

    const updated = await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Application deleted' });
      return;
    }

    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addTimelineEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, title, description, occurredAt } = req.body;

    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Timeline event added' });
      return;
    }

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    application.timeline.push({
      type: type || 'NOTE',
      title: title || 'Note Logged',
      description,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date()
    });

    application.lastActivityAt = new Date();
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Timeline event logged successfully',
      data: application.timeline
    });
  } catch (error) {
    next(error);
  }
};
