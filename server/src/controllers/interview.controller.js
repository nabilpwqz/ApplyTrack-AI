import Interview from '../models/Interview.js';
import Application from '../models/Application.js';

// Get user's interviews
export const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id })
      .populate({
        path: 'applicationId',
        populate: { path: 'companyId' },
      })
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

// Create new interview
export const createInterview = async (req, res, next) => {
  try {
    const { applicationId, type, scheduledAt, duration, interviewer, meetingUrl, location, notes } = req.body;

    if (!applicationId || !type || !scheduledAt) {
      res.status(400);
      throw new Error('Please enter all required fields (applicationId, type, scheduledAt)');
    }

    const app = await Application.findOne({ _id: applicationId, userId: req.user.id });
    if (!app) {
      res.status(404);
      throw new Error('Associated application not found');
    }

    const interview = new Interview({
      userId: req.user.id,
      applicationId,
      type,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 30,
      interviewer,
      meetingUrl,
      location,
      notes,
    });

    await interview.save();

    // Auto-update application status to INTERVIEW if it isn't already INTERVIEW or FINAL_INTERVIEW
    if (!['INTERVIEW', 'FINAL_INTERVIEW'].includes(app.status)) {
      const oldStatus = app.status;
      app.status = 'INTERVIEW';
      app.timeline.push({
        type: 'STATUS_CHANGE',
        title: 'Stage updated to INTERVIEW',
        description: `Triggered by scheduled interview: ${type}`,
        occurredAt: new Date(),
      });
    }

    // Add scheduled timeline event
    app.timeline.push({
      type: 'INTERVIEW_SCHEDULED',
      title: `${type} Interview Scheduled`,
      description: `With ${interviewer || 'Hiring Team'} via ${location || 'Video Call'} on ${new Date(scheduledAt).toLocaleString()}`,
      occurredAt: new Date(),
    });

    await app.save();

    res.status(201).json({
      success: true,
      message: 'Interview created successfully',
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

// Update interview details
export const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) {
      res.status(404);
      throw new Error('Interview not found');
    }

    const { type, scheduledAt, duration, interviewer, meetingUrl, location, notes, result, feedback } = req.body;

    if (type) interview.type = type;
    if (scheduledAt) interview.scheduledAt = scheduledAt;
    if (duration) interview.duration = duration;
    if (interviewer) interview.interviewer = interviewer;
    if (meetingUrl !== undefined) interview.meetingUrl = meetingUrl;
    if (location !== undefined) interview.location = location;
    if (notes !== undefined) interview.notes = notes;
    if (result) interview.result = result;
    if (feedback !== undefined) interview.feedback = feedback;

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

// Delete interview
export const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!interview) {
      res.status(404);
      throw new Error('Interview not found');
    }

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
