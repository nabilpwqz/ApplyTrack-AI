import cron from 'node-cron';
import { reminderService } from './reminder.service.js';

export const initCronJobs = () => {
  console.log('⏰ Initializing Background Cron Scheduler...');

  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await reminderService.scanAndGenerateReminders();
    } catch (err) {
      console.error('❌ Cron Job Error:', err.message);
    }
  });

  // Also do a quick run 5 seconds after startup to verify, and every hour
  setTimeout(async () => {
    try {
      await reminderService.scanAndGenerateReminders();
    } catch (err) {
      console.error('❌ Initial Cron Job Startup Error:', err.message);
    }
  }, 5000);
};
