import cron from 'node-cron';
import { scanInactiveApplications, scanUpcomingInterviews, scanUpcomingDeadlines } from './reminder.service';
import { sendWeeklyReports } from './report.service';

export const initCronJobs = (): void => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder scanners...');
    await scanInactiveApplications();
    await scanUpcomingInterviews();
    await scanUpcomingDeadlines();
  });
  
  cron.schedule('0 10 * * 0', async () => {
    console.log('Running weekly report generator (Sunday 10:00 AM)...');
    await sendWeeklyReports();
  });

  console.log('Background Cron Job Daemon Active (09:00 AM daily scanner, 10:00 AM Sunday reporter)');
};