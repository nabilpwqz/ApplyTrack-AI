import cron from 'node-cron';
import { scanInactiveApplications, scanUpcomingInterviews, scanUpcomingDeadlines } from './reminder.service';

export const initCronJobs = (): void => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder scanners...');
    await scanInactiveApplications();
    await scanUpcomingInterviews();
    await scanUpcomingDeadlines();
  });
  console.log('Background Cron Job Daemon Active (09:00 AM scanner)');
};