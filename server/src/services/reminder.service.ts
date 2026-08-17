import Application from '../models/Application';
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
      console.log(`⏰ Reminder Scanner: Created ${createdCount} follow-up reminders for inactive applications.`);
    }

    return createdCount;
  } catch (error: any) {
    console.error('❌ Inactivity scanner error:', error.message);
    return 0;
  }
};