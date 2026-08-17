import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { seedService } from '../services/seed.service.js';

// Helper to generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id, user.email),
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
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
          token: generateToken(user._id, user.email),
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

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
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

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
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

// Access / Login to demo account and auto-seed database
export const loginDemoAccount = async (req, res, next) => {
  try {
    const demoEmail = 'nabil@applytrack.ai';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      // Create demo user
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('demopassword123', salt);

      user = await User.create({
        name: 'Nabil',
        email: demoEmail,
        passwordHash,
        profile: {
          headline: 'Frontend Engineer | React Specialist',
          location: 'Austin, TX',
          experienceLevel: 'JUNIOR',
          skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'HTML', 'CSS', 'Tailwind CSS'],
          preferredRoles: ['Frontend Engineer', 'Full Stack Developer', 'React Developer'],
          preferredLocations: ['Austin, TX', 'Remote', 'New York, NY'],
          preferredSalary: {
            min: 85000,
            max: 120000,
            currency: 'USD',
          },
        },
        preferences: {
          emailNotifications: true,
          reminderNotifications: true,
          timezone: 'EST',
        },
      });
    }

    // Seed the demo database with 42 jobs, reminders, etc.
    await seedService.seedDemoData(user._id);

    res.status(200).json({
      success: true,
      message: 'Demo login successful and database seeded',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.email),
        profile: user.profile,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};
