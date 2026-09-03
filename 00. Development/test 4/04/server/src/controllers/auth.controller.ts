import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import User from '../models/User';
import { env } from '../config/env';
import { seedService } from '../services/seed.service';
import { isMongoConnected } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

const generateToken = (userId: string, email: string) => {
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    if (!isMongoConnected) {
      const mockId = 'user_' + Date.now();
      res.status(201).json({
        success: true,
        message: 'User registered (Standalone Mode)',
        data: {
          _id: mockId,
          name,
          email,
          token: generateToken(mockId, email),
        },
      });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString(), user.email),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    if (!isMongoConnected) {
      const mockId = 'demo_user_123';
      res.status(200).json({
        success: true,
        message: 'Login successful (Standalone Mode)',
        data: {
          _id: mockId,
          name: email.split('@')[0],
          email,
          token: generateToken(mockId, email),
        },
      });
      return;
    }

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id.toString(), user.email),
          profile: user.profile,
          preferences: user.preferences,
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        data: {
          _id: req.user!.id,
          name: 'Guest',
          email: req.user!.email,
          profile: {
            headline: 'Frontend Software Engineer',
            location: 'Austin, TX',
            experienceLevel: 'JUNIOR',
            skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'CSS'],
          },
        },
      });
      return;
    }

    const user = await User.findById(req.user!.id).select('-passwordHash');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: req.user!.id,
          name: req.body.name || 'Guest',
          email: req.user!.email,
          profile: req.body.profile,
          preferences: req.body.preferences,
        },
      });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, profile, preferences } = req.body;
    if (name) user.name = name;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
        preferences: updatedUser.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginDemoAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const demoEmail = 'guest@applytrack.ai';
    const mockId = 'demo_guest_99';

    if (isMongoConnected) {
      try {
        let user = await User.findOne({ email: demoEmail });

        if (!user) {
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash('demopassword123', salt);

          user = await User.create({
            name: 'Guest',
            email: demoEmail,
            passwordHash,
            profile: {
              headline: 'Frontend Engineer | React Specialist',
              location: 'Austin, TX',
              experienceLevel: 'JUNIOR',
              skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'HTML', 'CSS'],
              preferredRoles: ['Frontend Engineer', 'Full Stack Developer'],
              preferredSalary: { min: 85000, max: 120000, currency: 'USD' },
            },
          });
        }

        await seedService.seedDemoData(user._id);

        res.status(200).json({
          success: true,
          message: 'Demo login successful and database seeded',
          data: {
            _id: user._id,
            name: 'Guest',
            email: user.email,
            token: generateToken(user._id.toString(), user.email),
            profile: user.profile,
          },
        });
        return;
      } catch (dbErr: any) {
        console.warn('DB Seeding error, switching to Standalone Demo response:', dbErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Demo login successful',
      data: {
        _id: mockId,
        name: 'Guest',
        email: demoEmail,
        token: generateToken(mockId, demoEmail),
        profile: {
          headline: 'Frontend Engineer | React Specialist',
          location: 'Austin, TX',
          experienceLevel: 'JUNIOR',
          skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Password changed successfully (Standalone Mode)' });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      res.status(400);
      throw new Error('Avatar image data is required');
    }

    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Avatar updated (Standalone Mode)', data: { avatar } });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.avatar = avatar;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: { avatar: user.avatar }
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Account deactivated (Standalone Mode)' });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};


export const forgotPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    if (!isMongoConnected) {
      res.status(200).json({
        success: true,
        message: 'Password reset token generated (Standalone Mode)',
        data: { resetToken: 'demo_reset_token_123' }
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been generated.'
      });
      return;
    }

    const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    console.log(`🔑 Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Password reset token generated. Check server console (demo mode - no email service connected).',
      data: { resetToken }
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      res.status(400);
      throw new Error('Reset token and new password are required');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    if (!isMongoConnected) {
      res.status(200).json({ success: true, message: 'Password reset successfully (Standalone Mode)' });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Reset token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};