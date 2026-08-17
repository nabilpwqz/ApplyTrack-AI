import Application from '../models/Application';
import Reminder from '../models/Reminder';
import { isMongoConnected } from '../config/db';

export const scanInactiveApplications = async (): Promise<number> => {
  if (!isMongoConnected) return 0;
  
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const inactiveApps = await Application.find({
      status: { $nin: ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'GHOSTED'] },
      lastActivityAt: { $lte: tenDaysAgo }
    });

    let createdCount = 0;

    for (const app of inactiveApps) {
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
          description: `No update logged for over 10 days. Send follow-up email.`,
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          type: 'FOLLOW_UP',
          completed: false
        });
        createdCount++;
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
