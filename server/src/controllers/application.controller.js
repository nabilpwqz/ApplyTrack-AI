import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Interview from '../models/Interview.js';
import Reminder from '../models/Reminder.js';
import AIAnalysis from '../models/AIAnalysis.js';
import { aiService } from '../services/ai.service.js';

// Get all applications for current user with filters & search
export const getApplications = async (req, res, next) => {
  try {
    const { status, priority, search, sort } = req.query;
    const query = { userId: req.user.id };

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    let applications = await Application.find(query).populate('companyId');

    // Filter by search (matches company name or job title)
    if (search) {
      const searchLower = search.toLowerCase();
      applications = applications.filter(
        (app) =>
          app.jobTitle.toLowerCase().includes(searchLower) ||
          (app.companyId && app.companyId.name.toLowerCase().includes(searchLower))
      );
    }

    // Sorting
    if (sort) {
      if (sort === 'NEWEST') {
        applications.sort((a, b) => b.applicationDate - a.applicationDate);
      } else if (sort === 'OLDEST') {
        applications.sort((a, b) => a.applicationDate - b.applicationDate);
      } else if (sort === 'HIGHEST_SALARY') {
        applications.sort((a, b) => b.salary.max - a.salary.max);
      } else if (sort === 'UPCOMING_DEADLINE') {
        applications.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline - b.deadline;
        });
      } else if (sort === 'NEXT_FOLLOWUP') {
        applications.sort((a, b) => {
          if (!a.nextFollowUpAt) return 1;
          if (!b.nextFollowUpAt) return -1;
          return a.nextFollowUpAt - b.nextFollowUpAt;
        });
      }
    } else {
      // Default: newest first
      applications.sort((a, b) => b.createdAt - a.createdAt);
    }

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// Create new application
export const createApplication = async (req, res, next) => {
  try {
    const {
      companyName,
      domain,
      jobTitle,
      jobUrl,
      source,
      location,
      workMode,
      employmentType,
      salary,
      status,
      priority,
      applicationDate,
      deadline,
      notes,
      tags,
      contacts,
    } = req.body;

    if (!companyName || !jobTitle) {
      res.status(400);
      throw new Error('Company name and Job title are required');
    }

    // 1. Resolve Company (find by name case-insensitive or create)
    let company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
    if (!company) {
      // Analyze company automatically using AI/Mock to populate health stats
      const companyDetails = await aiService.analyzeCompanyHealth(companyName, domain);
      company = new Company({
        name: companyName,
        domain: domain || companyDetails.website.replace('https://www.', '').replace('https://', ''),
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

    // 2. Create the Application
    const application = new Application({
      userId: req.user.id,
      companyId: company._id,
      jobTitle,
      jobUrl,
      source: source || 'LinkedIn',
      location,
      workMode: workMode || 'UNKNOWN',
      employmentType: employmentType || 'FULL_TIME',
      salary: salary || { min: 0, max: 0, currency: 'USD' },
      status: status || 'APPLIED',
      priority: priority || 'MEDIUM',
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      deadline: deadline ? new Date(deadline) : null,
      notes,
      tags: tags || [],
      contacts: contacts || [],
      timeline: [
        {
          type: 'CREATION',
          title: 'Application Created',
          description: `Logged via platform. Status: ${status || 'APPLIED'}.`,
          occurredAt: applicationDate ? new Date(applicationDate) : new Date(),
        },
      ],
    });

    // Determine initial nextFollowUpAt (default: 7 days after application)
    if (status === 'APPLIED') {
      const followUpDate = new Date(application.applicationDate);
      followUpDate.setDate(followUpDate.getDate() + 7);
      application.nextFollowUpAt = followUpDate;
    }

    await application.save();

    // 3. Pre-trigger an AI Interview Probability calculation in background and cache it
    // Wait, let's trigger it now so it is cached in AIAnalysis immediately!
    const userProfileSkills = []; // Fetch from User if needed
    const prob = await aiService.calculateInterviewProbability(
      jobTitle,
      company.name,
      notes,
      userProfileSkills,
      'JUNIOR'
    );

    const aiAnalysis = new AIAnalysis({
      userId: req.user.id,
      applicationId: application._id,
      type: 'INTERVIEW_PROBABILITY',
      score: prob.score,
      result: prob.result,
      factors: prob.factors,
      recommendations: prob.recommendations,
    });
    await aiAnalysis.save();

    // Return the application with populated company
    const populated = await Application.findById(application._id).populate('companyId');

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// Get single application detail (includes interviews, reminders, and cached AI stats)
export const getApplicationById = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user.id }).populate('companyId');
    if (!app) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Fetch related records
    const interviews = await Interview.find({ applicationId: app._id });
    const reminders = await Reminder.find({ applicationId: app._id });
    const aiAnalyses = await AIAnalysis.find({ applicationId: app._id });

    res.status(200).json({
      success: true,
      data: {
        application: app,
        interviews,
        reminders,
        aiAnalyses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update application
export const updateApplication = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!app) {
      res.status(404);
      throw new Error('Application not found');
    }

    const oldStatus = app.status;
    const {
      jobTitle,
      jobUrl,
      source,
      location,
      workMode,
      employmentType,
      salary,
      status,
      priority,
      applicationDate,
      deadline,
      nextFollowUpAt,
      resumeUsed,
      coverLetterUsed,
      notes,
      tags,
      contacts,
    } = req.body;

    if (jobTitle) app.jobTitle = jobTitle;
    if (jobUrl !== undefined) app.jobUrl = jobUrl;
    if (source) app.source = source;
    if (location !== undefined) app.location = location;
    if (workMode) app.workMode = workMode;
    if (employmentType) app.employmentType = employmentType;
    if (salary) app.salary = salary;
    if (priority) app.priority = priority;
    if (applicationDate) app.applicationDate = applicationDate;
    if (deadline !== undefined) app.deadline = deadline;
    if (nextFollowUpAt !== undefined) app.nextFollowUpAt = nextFollowUpAt;
    if (resumeUsed !== undefined) app.resumeUsed = resumeUsed;
    if (coverLetterUsed !== undefined) app.coverLetterUsed = coverLetterUsed;
    if (notes !== undefined) app.notes = notes;
    if (tags) app.tags = tags;
    if (contacts) app.contacts = contacts;

    if (status && status !== oldStatus) {
      app.status = status;
      // Add status change timeline log
      app.timeline.push({
        type: 'STATUS_CHANGE',
        title: `Stage updated to ${status}`,
        description: `Application moved from ${oldStatus} to ${status}`,
        occurredAt: new Date(),
      });

      // Clear scheduled follow up if status is OFFER, ACCEPTED, REJECTED
      if (['OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'GHOSTED'].includes(status)) {
        app.nextFollowUpAt = null;
      }
    }

    await app.save();

    const populated = await Application.findById(app._id).populate('companyId');

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// Delete application
export const deleteApplication = async (req, res, next) => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!app) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Delete cascading dependencies
    await Interview.deleteMany({ applicationId: app._id });
    await Reminder.deleteMany({ applicationId: app._id });
    await AIAnalysis.deleteMany({ applicationId: app._id });

    res.status(200).json({
      success: true,
      message: 'Application and all associated interviews/reminders deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Add custom timeline event to an application
export const addTimelineEvent = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user.id });
    if (!app) {
      res.status(404);
      throw new Error('Application not found');
    }

    const { type, title, description, occurredAt } = req.body;
    if (!title) {
      res.status(400);
      throw new Error('Timeline event title is required');
    }

    app.timeline.push({
      type: type || 'NOTE',
      title,
      description,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
    });

    await app.save();

    res.status(200).json({
      success: true,
      message: 'Timeline event added successfully',
      data: app.timeline,
    });
  } catch (error) {
    next(error);
  }
};
