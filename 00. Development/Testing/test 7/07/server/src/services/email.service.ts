import EmailEvent from '../models/EmailEvent';
import { aiService } from './ai.service';
import { isMongoConnected } from '../config/db';

export const syncRecruiterEmails = async (userId: string): Promise<any[]> => {
  if (!isMongoConnected) return [];

  try {
    const mockEmails = [
      {
        sender: 'careers@google.com',
        subject: 'Google Application Status Update - Frontend Engineer',
        bodyPreview: 'Dear Guest, Thank you for interviewing with Google. We would love to invite you for a panel technical loop next week...',
        externalId: 'sim_email_' + Date.now() + '_1'
      },
      {
        sender: 'talent@openai.com',
        subject: 'OpenAI Assessment Invitation',
        bodyPreview: 'Hi Guest, Your profile stood out for our Full Stack Developer role. Please complete this code assessment within 5 days...',
        externalId: 'sim_email_' + Date.now() + '_2'
      }
    ];

    const syncedEvents: any[] = [];

    for (const mock of mockEmails) {
      const existing = await EmailEvent.findOne({ externalId: mock.externalId });
      if (!existing) {
        const parsed = await aiService.parseRecruiterEmail(mock.bodyPreview, mock.sender, mock.subject);

        const emailEvent = await EmailEvent.create({
          userId,
          provider: 'SIMULATION',
          externalId: mock.externalId,
          sender: mock.sender,
          subject: mock.subject,
          bodyPreview: mock.bodyPreview,
          extractedData: parsed,
          confidence: parsed.confidence || 0.9,
          processed: false
        });

        syncedEvents.push(emailEvent);
      }
    }

    return syncedEvents;
  } catch (error: any) {
    console.error('❌ Email sync error:', error.message);
    return [];
  }
};
