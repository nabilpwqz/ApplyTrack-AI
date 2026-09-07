import User from '../models/User';
import Application from '../models/Application';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendWeeklyReports = async (): Promise<void> => {
  try {
    const users = await User.find({ role: 'USER' });
    
    for (const user of users) {
      // Calculate basic metrics for this user
      const totalApps = await Application.countDocuments({ userId: user._id });
      const activeApps = await Application.countDocuments({ 
        userId: user._id,
        status: { $in: ['SCREENING', 'ASSESSMENT', 'INTERVIEW', 'FINAL_INTERVIEW'] }
      });

      const htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; background-color: #090d16; color: #fff;">
          <h2 style="color: #f59e0b;">ApplyTrack.AI Weekly Report</h2>
          <p>Hi ${user.name},</p>
          <p>Here is your weekly summary:</p>
          <ul>
            <li><strong>Total Applications:</strong> ${totalApps}</li>
            <li><strong>Active Pipeline:</strong> ${activeApps}</li>
          </ul>
          <p>Keep up the great work and stay persistent!</p>
        </div>
      `;

      if (process.env.SMTP_USER) {
        await transporter.sendMail({
          from: '"ApplyTrack AI" <noreply@applytrack.ai>',
          to: user.email,
          subject: 'Your Weekly Career Progress Report 📈',
          html: htmlContent
        });
      }
    }
  } catch (error) {
    console.error('Failed to send weekly reports:', error);
  }
};
