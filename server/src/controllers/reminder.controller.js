import Reminder from '../models/Reminder.js';
import Application from '../models/Application.js';

// Get reminders
export const getReminders = async (req, res, next) => {
  try {
    const { completed } = req.query;
    const filter = { userId: req.user.id };

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    const reminders = await Reminder.find(filter)
      .populate({
        path: 'applicationId',
        populate: { path: 'companyId' },
      })
      .sort({ dueAt: 1 });

    res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};

// Create manual reminder
export const createReminder = async (req, res, next) => {
  try {
    const { applicationId, type, title, description, dueAt } = req.body;

    if (!applicationId || !title || !dueAt) {
      res.status(400);
      throw new Error('Associated Application ID, Title, and Due Date are required');
    }

    const app = await Application.findOne({ _id: applicationId, userId: req.user.id });
    if (!app) {
      res.status(404);
      throw new Error('Application not found');
    }

    const reminder = new Reminder({
      userId: req.user.id,
      applicationId,
      type: type || 'FOLLOW_UP',
      title,
      description,
      dueAt: new Date(dueAt),
    });

    await reminder.save();

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle reminder completed status
export const toggleReminderComplete = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!reminder) {
      res.status(404);
      throw new Error('Reminder not found');
    }

    reminder.completed = !reminder.completed;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: `Reminder marked as ${reminder.completed ? 'completed' : 'incomplete'}`,
      data: reminder,
    });
  } catch (error) {
    next(error);
  }
};

// Delete reminder
export const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!reminder) {
      res.status(404);
      throw new Error('Reminder not found');
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
