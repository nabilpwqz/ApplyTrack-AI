import { Response, NextFunction } from 'express';
import EmailEvent from '../models/EmailEvent';
import Application from '../models/Application';
import Company from '../models/Company';
import { AuthenticatedRequest } from '../middleware/auth';
import { syncRecruiterEmails } from '../services/email.service';
import { isMongoConnected } from '../config/db';

export const syncEmails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const syncedEvents = await syncRecruiterEmails(req.user!.id);
    res.status(200).json({
      success: true,
      message: `Synced recruiter emails. Found ${syncedEvents.length} new records.`,
      data: syncedEvents
    });
  } catch (error) {
    next(error);
  }
};

export const getEmailEvents = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        data: [
          {
            _id: 'sim-email-001',
            provider: 'SIMULATION',
            sender: 'careers@google.com',
            subject: 'Google Application Received - Frontend Developer',
            bodyPreview: 'Dear Guest, Thank you for applying for the Frontend Developer position at Google. We have received your application and our recruiting team is currently reviewing your qualifications.',
            receivedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
            extractedData: { company: 'Google', jobTitle: 'Frontend Developer', applicationStatus: 'APPLIED', recruiterEmail: 'careers@google.com' },
            confidence: 0.98,
            processed: false,
          }
        ]
      });
      return;
    }

    const events = await EmailEvent.find({ userId: req.user!.id, processed: false }).sort({ receivedAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

export const processEmailEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { action, applicationId } = req.body;

    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        message: 'Email sync action completed successfully',
        data: null
      });
      return;
    }

    const emailEvent = await EmailEvent.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!emailEvent) {
      res.status(404);
      throw new Error('Email event record not found');
    }

    if (action === 'CREATE') {
      const extracted = emailEvent.extractedData;
      let company = await Company.findOne({ name: { $regex: new RegExp(`^${extracted.company}$`, 'i') } });
      if (!company) {
        company = await Company.create({
          name: extracted.company || 'Company',
          healthScore: 80,
          layoffRisk: 15
        });
      }

      const app = await Application.create({
        userId: req.user!.id,
        jobTitle: extracted.jobTitle || 'Software Engineer',
        companyId: company._id,
        companyName: company.name,
        status: extracted.applicationStatus || 'APPLIED',
        priority: 'MEDIUM',
        source: 'Email Sync',
        applicationDate: new Date(),
        lastActivityAt: new Date(),
        timeline: [
          {
            type: 'EMAIL_SYNC',
            title: `Application created from email update`,
            description: emailEvent.subject,
            occurredAt: new Date()
          }
        ],
        contacts: extracted.recruiterEmail ? [{ name: 'Recruiter', email: extracted.recruiterEmail }] : []
      });

      emailEvent.processed = true;
      emailEvent.applicationId = app._id as any;
      await emailEvent.save();
    } else if (action === 'UPDATE' && applicationId) {
      const app = await Application.findOne({ _id: applicationId, userId: req.user!.id });
      if (app) {
        if (emailEvent.extractedData.applicationStatus) {
          app.status = emailEvent.extractedData.applicationStatus as any;
        }
        app.lastActivityAt = new Date();
        app.timeline.push({
          type: 'EMAIL_SYNC',
          title: `Updated stage from email`,
          description: emailEvent.subject,
          occurredAt: new Date()
        });
        await app.save();
      }

      emailEvent.processed = true;
      emailEvent.applicationId = applicationId as any;
      await emailEvent.save();
    } else if (action === 'DISMISS') {
      emailEvent.processed = true;
      await emailEvent.save();
    }

    res.status(200).json({
      success: true,
      message: 'Email event processed successfully'
    });
  } catch (error) {
    next(error);
  }
};
