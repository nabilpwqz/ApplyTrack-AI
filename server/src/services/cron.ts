import cron from 'node-cron';
import { scanInactiveApplications } from './reminder.service';

export const initCronJobs = (): void => {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily inactivity scanner cron job...');
    await scanInactiveApplications();
  });

  console.log('⚡ Background Cron Job Daemon Active (09:00 AM scanner)');
};
