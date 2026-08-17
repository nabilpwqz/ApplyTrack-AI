import Application from '../models/Application.js';
import Reminder from '../models/Reminder.js';

export const reminderService = {
  // Scans all applications for inactivity (>10 days) and triggers follow-up reminders
  scanAndGenerateReminders: async () => {
    console.log('⏰ Running automatic application inactivity check...');
    try {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      // Find applications in progress with no activity for 10 days
      const inactiveApplications = await Application.find({
        status: { $in: ['SAVED', 'APPLIED', 'SCREENING', 'ASSESSMENT', 'INTERVIEW'] },
        lastActivityAt: { $lte: tenDaysAgo },
      }).populate('companyId');

      let createdCount = 0;

      for (const app of inactiveApplications) {
        // Check if an uncompleted reminder of type FOLLOW_UP already exists
        const existingReminder = await Reminder.findOne({
          applicationId: app._id,
          type: 'FOLLOW_UP',
          completed: false,
        });

        if (!existingReminder) {
          const companyName = app.companyId ? app.companyId.name : 'Company';
          
          // Create reminder
          const reminder = new Reminder({
            userId: app.userId,
            applicationId: app._id,
            type: 'FOLLOW_UP',
            title: `Follow up with ${companyName}`,
            description: `No application activity detected for over 10 days for the ${app.jobTitle} position. Consider sending a recruiter note.`,
            dueAt: new Date(), // due immediately
          });
          await reminder.save();

          // Push reminder to application timeline
          app.timeline.push({
            type: 'REMINDER_DUE',
            title: `Follow-up reminder auto-scheduled`,
            description: `AI flagged this application as inactive (no updates for 10+ days).`,
            occurredAt: new Date(),
          });
          // Note: pre-save will update lastActivityAt, so next time it won't be picked up again immediately.
          await app.save();

          createdCount++;
        }
      }

      console.log(`⏰ Inactivity check completed. Generated ${createdCount} follow-up reminders.`);
      return createdCount;
    } catch (error) {
      console.error('❌ Error during inactivity scan:', error.message);
      throw error;
    }
  },
};
export default reminderService;
