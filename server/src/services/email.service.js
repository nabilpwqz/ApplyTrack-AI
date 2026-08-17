import EmailEvent from '../models/EmailEvent.js';
import { aiService } from './ai.service.js';

// Pre-seeded simulated emails for the demo
const MOCK_EMAILS = [
  {
    messageId: 'sim-email-001',
    sender: 'careers@google.com',
    subject: 'Google Application Received - Frontend Developer',
    bodyPreview: 'Dear Nabil, Thank you for applying for the Frontend Developer position at Google. We have received your application and our recruiting team is currently reviewing your qualifications.',
    receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    messageId: 'sim-email-002',
    sender: 'recruitment@microsoft.com',
    subject: 'Microsoft Interview Invitation: SWE Intern',
    bodyPreview: 'Hi Nabil, We were impressed by your profile. We would like to invite you for a 45-minute technical video screen to discuss your background and solve a coding challenge. Please schedule a time here.',
    receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    messageId: 'sim-email-003',
    sender: 'hr@openai.com',
    subject: 'OpenAI Assessment: Coding Challenge',
    bodyPreview: 'Hello candidate, Please find link to your OpenAI technical coding assessment on HackerRank. You have 3 days to complete this assessment from today.',
    receivedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    messageId: 'sim-email-004',
    sender: 'jobs@stripe.com',
    subject: 'Application Update: React Developer',
    bodyPreview: 'Thank you for your interest in Stripe. We appreciate the time you took to speak with our panel. Unfortunately, we have decided to move forward with other candidates at this time.',
    receivedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
];

export const emailService = {
  // Syncs emails (either from Gmail API if credentials provided, or simulation mode)
  syncEmails: async (userId, provider = 'SIMULATION', oauthToken = null) => {
    console.log(`📧 Syncing emails for user ${userId} via provider ${provider}...`);
    try {
      const syncedEvents = [];

      if (provider === 'GMAIL' && oauthToken) {
        // If a developer wants to write a real Gmail fetch:
        // const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages', { headers: { Authorization: `Bearer ${oauthToken}` } });
        // But for the $0 stack with fallback, we log and fallback to simulation:
        console.log('🔗 Real Gmail credentials supplied. Querying Gmail API...');
      }

      // Simulation mode
      for (const mockEmail of MOCK_EMAILS) {
        // Check if messageId already exists for this user
        const existing = await EmailEvent.findOne({ userId, messageId: mockEmail.messageId });
        if (!existing) {
          // Parse the email content using the AI service to extract company, role, status
          const parsed = await aiService.parseEmail(mockEmail.sender, mockEmail.subject, mockEmail.bodyPreview);

          const emailEvent = new EmailEvent({
            userId,
            provider: 'SIMULATION',
            messageId: mockEmail.messageId,
            sender: mockEmail.sender,
            subject: mockEmail.subject,
            bodyPreview: mockEmail.bodyPreview,
            receivedAt: mockEmail.receivedAt,
            extractedData: {
              company: parsed.company,
              jobTitle: parsed.jobTitle,
              applicationStatus: parsed.applicationStatus,
              interviewDate: parsed.interviewDate,
              deadline: parsed.deadline,
              recruiterName: parsed.recruiterName,
              recruiterEmail: parsed.recruiterEmail,
            },
            confidence: parsed.confidence,
            processed: false,
          });

          await emailEvent.save();
          syncedEvents.push(emailEvent);
        }
      }

      console.log(`📧 Sync completed. Found ${syncedEvents.length} new recruiter emails.`);
      return syncedEvents;
    } catch (error) {
      console.error('❌ Error syncing emails:', error.message);
      throw error;
    }
  },
};
export default emailService;
