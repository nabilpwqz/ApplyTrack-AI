import { Response, NextFunction } from 'express';
import Interview from '../models/Interview';
import Application from '../models/Application';
import { AuthenticatedRequest } from '../middleware/auth';
import { isMongoConnected } from '../config/db';

export const getInterviews = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const interviews = await Interview.find({ userId: req.user!.id })
      .populate({
        path: 'applicationId',
        populate: { path: 'companyId' }
      })
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

export const createInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId, type, scheduledAt, duration, interviewer, meetingUrl, location, notes } = req.body;

    if (!applicationId || !scheduledAt) {
      res.status(400);
      throw new Error('Application ID and Scheduled Date/Time are required');
    }

    if (!isMongoConnected) {
      res.status(201).json({ success: true, message: 'Interview scheduled' });
      return;
    }

    const application = await Application.findOne({ _id: applicationId, userId: req.user!.id });
    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    const interview = await Interview.create({
      applicationId,
      userId: req.user!.id,
      type: type || 'TECHNICAL',
      scheduledAt: new Date(scheduledAt),
      duration: duration || 45,
      interviewer,
      meetingUrl,
      location: location || 'Google Meet',
      notes
    });

    application.status = 'INTERVIEW';
    application.lastActivityAt = new Date();
    application.timeline.push({
      type: 'INTERVIEW_SCHEDULED',
      title: `${type || 'Technical'} Interview Scheduled`,
      description: `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      occurredAt: new Date()
    });
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Interview updated' });
      return;
    }

    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      req.body,
      { new: true }
    );

    if (!interview) {
      res.status(404);
      throw new Error('Interview not found');
    }

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Interview deleted' });
      return;
    }

    const interview = await Interview.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    if (!interview) {
      res.status(404);
      throw new Error('Interview not found');
    }

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
