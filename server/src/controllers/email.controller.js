import EmailEvent from '../models/EmailEvent.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import { emailService } from '../services/email.service.js';
import { aiService } from '../services/ai.service.js';
import AIAnalysis from '../models/AIAnalysis.js';

// Sync recruiter emails (calls the service)
export const syncRecruiterEmails = async (req, res, next) => {
  try {
    const events = await emailService.syncEmails(req.user.id, 'SIMULATION');
    res.status(200).json({
      success: true,
      message: `Synched emails. Found ${events.length} new records.`,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve all unprocessed email events
export const getUnprocessedEvents = async (req, res, next) => {
  try {
    const events = await EmailEvent.find({ userId: req.user.id, processed: false })
      .sort({ receivedAt: -1 });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm or dismiss email import
export const processEmailImport = async (req, res, next) => {
  try {
    const { action, applicationId } = req.body;
    const event = await EmailEvent.findOne({ _id: req.params.eventId, userId: req.user.id });

    if (!event) {
      res.status(404);
      throw new Error('Email event not found');
    }

    if (action === 'DISMISS') {
      event.processed = true;
      await event.save();
      return res.status(200).json({
        success: true,
        message: 'Email event dismissed successfully',
      });
    }

    let app;

    if (action === 'CREATE') {
      const companyName = event.extractedData.company || 'Unknown Company';
      
      // Resolve company
      let company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
      if (!company) {
        const companyDetails = await aiService.analyzeCompanyHealth(companyName);
        company = new Company({
          name: companyName,
          domain: companyDetails.website.replace('https://www.', '').replace('https://', ''),
          website: companyDetails.website,
          industry: companyDetails.industry,
          size: companyDetails.size,
          foundedYear: companyDetails.foundedYear,
          description: companyDetails.description,
          healthScore: companyDetails.healthScore,
          layoffRisk: companyDetails.layoffRisk,
          factors: companyDetails.factors,
          lastAnalyzedAt: new Date(),
        });
        await company.save();
      }

      // Create new application
      app = new Application({
        userId: req.user.id,
        companyId: company._id,
        jobTitle: event.extractedData.jobTitle || 'Software Engineer',
        source: 'Email Import',
        status: event.extractedData.applicationStatus || 'APPLIED',
        applicationDate: event.receivedAt,
        timeline: [
          {
            type: 'CREATION',
            title: 'Application Created via Email Sync',
            description: `Imported from email: "${event.subject}"`,
            occurredAt: new Date(),
          },
        ],
      });

      // Calculate initial match score
      const prob = await aiService.calculateInterviewProbability(app.jobTitle, company.name, '', [], 'JUNIOR');
      const aiAnalysis = new AIAnalysis({
        userId: req.user.id,
        applicationId: app._id,
        type: 'INTERVIEW_PROBABILITY',
        score: prob.score,
        result: prob.result,
        factors: prob.factors,
        recommendations: prob.recommendations,
      });
      await aiAnalysis.save();

      if (event.extractedData.applicationStatus === 'INTERVIEW' && event.extractedData.interviewDate) {
        app.timeline.push({
          type: 'INTERVIEW_SCHEDULED',
          title: 'Interview Scheduled via Email Sync',
          description: `Scheduled at ${new Date(event.extractedData.interviewDate).toLocaleString()}`,
          occurredAt: new Date(),
        });
      }

      await app.save();

      event.applicationId = app._id;
      event.processed = true;
      await event.save();
    } 
    
    else if (action === 'UPDATE') {
      if (!applicationId) {
        res.status(400);
        throw new Error('Application ID is required for UPDATE action');
      }

      app = await Application.findOne({ _id: applicationId, userId: req.user.id });
      if (!app) {
        res.status(404);
        throw new Error('Target Application not found');
      }

      const oldStatus = app.status;
      const newStatus = event.extractedData.applicationStatus;

      app.status = newStatus;
      app.timeline.push({
        type: 'EMAIL_RECEIVED',
        title: `Status update detected from email`,
        description: `Subject: "${event.subject}". Stage moved from ${oldStatus} to ${newStatus}.`,
        occurredAt: new Date(),
      });

      if (newStatus === 'INTERVIEW' && event.extractedData.interviewDate) {
        app.timeline.push({
          type: 'INTERVIEW_SCHEDULED',
          title: 'Interview Scheduled via Email Import',
          description: `Details: Recruiter scheduled for ${new Date(event.extractedData.interviewDate).toLocaleString()}`,
          occurredAt: new Date(),
        });
      }

      await app.save();

      event.applicationId = app._id;
      event.processed = true;
      await event.save();
    }

    const populated = app ? await Application.findById(app._id).populate('companyId') : null;

    res.status(200).json({
      success: true,
      message: 'Email sync action completed successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
