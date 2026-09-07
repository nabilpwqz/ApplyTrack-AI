import Application from '../models/Application';
import Interview from '../models/Interview';
import Reminder from '../models/Reminder';
import { isMongoConnected } from '../config/db';

const getHealthStatus = (daysSinceActivity: number): string => {
  if (daysSinceActivity <= 7) return 'ACTIVE';
  if (daysSinceActivity <= 14) return 'NEEDS_ATTENTION';
  if (daysSinceActivity <= 21) return 'AT_RISK';
  return 'GHOSTED';
};

export const scanInactiveApplications = async (): Promise<number> => {
  if (!isMongoConnected) return 0;

  try {
    const activeApps = await Application.find({
      status: { $nin: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'] }
    });

    let createdCount = 0;

    for (const app of activeApps) {
      const daysSinceActivity = Math.floor(
        (Date.now() - new Date(app.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      const newHealth = getHealthStatus(daysSinceActivity);

      if (app.healthStatus !== newHealth) {
        app.healthStatus = newHealth as any;
        await app.save();
      }

      if (daysSinceActivity >= 10 && (newHealth === 'NEEDS_ATTENTION' || newHealth === 'AT_RISK')) {
        const existingReminder = await Reminder.findOne({
          applicationId: app._id,
          completed: false,
          type: 'FOLLOW_UP'
        });

        if (!existingReminder) {
          await Reminder.create({
            applicationId: app._id,
            userId: app.userId,
            title: `Follow up on ${app.jobTitle}`,
            description: `No update logged for ${daysSinceActivity} days. Send follow-up email.`,
            dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            type: 'FOLLOW_UP',
            completed: false
          });
          createdCount++;
        }
      }
    }

    if (createdCount > 0) {
      console.log(`Reminder Scanner: created inactive-application reminders`);
    }

    return createdCount;
  } catch (error: any) {
    console.error('Inactivity scanner error:', error.message);
    return 0;
  }
};

export const scanUpcomingInterviews = async (): Promise<number> => {
  if (!isMongoConnected) return 0;

  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const upcomingInterviews = await Interview.find({
      scheduledAt: { $gte: now, $lte: twoDaysFromNow }
    });

    let createdCount = 0;

    for (const interview of upcomingInterviews) {
      const existingReminder = await Reminder.findOne({
        applicationId: interview.applicationId,
        type: 'INTERVIEW_PREP',
        completed: false
      });

      if (!existingReminder) {
        await Reminder.create({
          applicationId: interview.applicationId,
          userId: interview.userId,
          title: `Prepare for upcoming interview`,
          description: `You have a ${interview.type} interview scheduled on ${new Date(interview.scheduledAt).toLocaleString()}.`,
          dueAt: interview.scheduledAt,
          type: 'INTERVIEW_PREP',
          completed: false
        });
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`Interview Scanner: created interview prep reminders`);
    }

    return createdCount;
  } catch (error: any) {
    console.error('Interview scanner error:', error.message);
    return 0;
  }
};

export const scanUpcomingDeadlines = async (): Promise<number> => {
  if (!isMongoConnected) return 0;

  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const applicationsWithDeadline = await Application.find({
      deadline: { $gte: now, $lte: threeDaysFromNow },
      status: { $nin: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'] }
    });

    let createdCount = 0;

    for (const app of applicationsWithDeadline) {
      const existingReminder = await Reminder.findOne({
        applicationId: app._id,
        type: 'OFFER_DEADLINE',
        completed: false
      });

      if (!existingReminder) {
        await Reminder.create({
          applicationId: app._id,
          userId: app.userId,
          title: `Deadline approaching for ${app.jobTitle}`,
          description: `The deadline for this application is approaching.`,
          dueAt: app.deadline,
          type: 'OFFER_DEADLINE',
          completed: false
        });
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`Deadline Scanner: created deadline reminders`);
    }

    return createdCount;
  } catch (error: any) {
    console.error('Deadline scanner error:', error.message);
    return 0;
  }
};