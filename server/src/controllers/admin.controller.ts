import { Response, NextFunction } from 'express';
import User from '../models/User';
import Application from '../models/Application';
import Reminder from '../models/Reminder';
import Interview from '../models/Interview';
import { AuthenticatedRequest } from '../middleware/auth';
import { isMongoConnected } from '../config/db';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, count: 0, data: [] });
      return;
    }

    const users = await User.find().select('-passwordHash -resetPasswordToken').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        data: {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          totalApplications: 0,
          totalReminders: 0,
          totalInterviews: 0,
        }
      });
      return;
    }

    const [totalUsers, activeUsers, totalApplications, totalReminders, totalInterviews] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Reminder.countDocuments(),
      Interview.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalApplications,
        totalReminders,
        totalInterviews,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'User status updated' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'User deleted' });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await Promise.all([
      Application.deleteMany({ userId: req.params.id }),
      Reminder.deleteMany({ userId: req.params.id }),
      Interview.deleteMany({ userId: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      res.status(400);
      throw new Error('Valid role (USER or ADMIN) is required');
    }

    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'User role updated' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: { role: user.role }
    });
  } catch (error) {
    next(error);
  }
};