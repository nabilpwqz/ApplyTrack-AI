import { Response, NextFunction } from 'express';
import Reminder from '../models/Reminder';
import { AuthenticatedRequest } from '../middleware/auth';
import { isMongoConnected } from '../config/db';

export const getReminders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const { completed } = req.query;
    const filter: any = { userId: req.user!.id };
    if (completed !== undefined) filter.completed = completed === 'true';

    const reminders = await Reminder.find(filter)
      .populate({
        path: 'applicationId',
        populate: { path: 'companyId' }
      })
      .sort({ dueAt: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    next(error);
  }
};

export const createReminder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId, title, description, dueAt, type } = req.body;

    if (!applicationId || !title || !dueAt) {
      res.status(400);
      throw new Error('Application ID, Title, and Due Date are required');
    }

    if (!isMongoConnected) {
      res.status(201).json({ success: true, message: 'Reminder created' });
      return;
    }

    const reminder = await Reminder.create({
      applicationId,
      userId: req.user!.id,
      title,
      description,
      dueAt: new Date(dueAt),
      type: type || 'FOLLOW_UP',
      completed: false
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

export const toggleReminderComplete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Task status updated' });
      return;
    }

    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!reminder) {
      res.status(404);
      throw new Error('Reminder not found');
    }

    reminder.completed = !reminder.completed;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${reminder.completed ? 'completed' : 'pending'}`,
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReminder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Reminder deleted' });
      return;
    }

    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    if (!reminder) {
      res.status(404);
      throw new Error('Reminder not found');
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
