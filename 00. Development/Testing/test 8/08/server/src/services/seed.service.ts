import Company from '../models/Company';
import Application from '../models/Application';
import Interview from '../models/Interview';
import Reminder from '../models/Reminder';
import EmailEvent from '../models/EmailEvent';
import AIAnalysis from '../models/AIAnalysis';
import { isMongoConnected } from '../config/db';

export const seedService = {
  seedDemoData: async (userId: any): Promise<boolean> => {
    if (!isMongoConnected) return true;

    try {
      await Application.deleteMany({ userId });
      await Interview.deleteMany({ userId });
      await Reminder.deleteMany({ userId });
      await EmailEvent.deleteMany({ userId });
      await AIAnalysis.deleteMany({ userId });

      const companiesData = [
        { name: 'Google', domain: 'google.com', website: 'https://google.com', industry: 'Big Tech', healthScore: 88, layoffRisk: 12, size: '10000+ employees', description: 'Search, Cloud, and AI leader.', factors: ['✓ Strong balance sheet', '✓ Active AI investment'] },
        { name: 'Microsoft', domain: 'microsoft.com', website: 'https://microsoft.com', industry: 'Big Tech', healthScore: 90, layoffRisk: 10, size: '10000+ employees', description: 'Windows, Azure, and Office creator.', factors: ['✓ Azure growth', '✓ OpenAI investment'] },
        { name: 'Amazon', domain: 'amazon.com', website: 'https://amazon.com', industry: 'E-commerce & Cloud', healthScore: 84, layoffRisk: 18, size: '10000+ employees', description: 'E-commerce and AWS cloud infrastructure.', factors: ['✓ AWS revenue dominance'] },
        { name: 'Meta', domain: 'meta.com', website: 'https://meta.com', industry: 'Social Media', healthScore: 86, layoffRisk: 15, size: '10000+ employees', description: 'Social connectivity and LLaMA open-source AI.', factors: ['✓ Ad revenue rebound'] },
        { name: 'Stripe', domain: 'stripe.com', website: 'https://stripe.com', industry: 'Fintech', healthScore: 85, layoffRisk: 15, size: '5001-10000 employees', description: 'Financial payments infrastructure for modern businesses.', factors: ['✓ Payment volume growth'] },
        { name: 'OpenAI', domain: 'openai.com', website: 'https://openai.com', industry: 'Artificial Intelligence', healthScore: 92, layoffRisk: 8, size: '1001-5000 employees', description: 'Generative AI and ChatGPT lab.', factors: ['✓ Generative AI product leader'] }
      ];

      const companyDocs: any = {};
      for (const comp of companiesData) {
        let existingComp = await Company.findOne({ name: comp.name });
        if (!existingComp) {
          existingComp = await Company.create(comp);
        }
        companyDocs[comp.name] = existingComp._id;
      }

      const applicationsSeed = [
        { jobTitle: 'Frontend Software Engineer', companyId: companyDocs['Google'], status: 'INTERVIEW', priority: 'HIGH', location: 'Mountain View, CA', workMode: 'HYBRID', salary: { min: 140000, max: 185000 } },
        { jobTitle: 'Software Engineering Intern', companyId: companyDocs['Microsoft'], status: 'SCREENING', priority: 'HIGH', location: 'Redmond, WA', workMode: 'ON_SITE', salary: { min: 45, max: 60 } },
        { jobTitle: 'Full Stack Engineer (API)', companyId: companyDocs['OpenAI'], status: 'ASSESSMENT', priority: 'HIGH', location: 'San Francisco, CA', workMode: 'HYBRID', salary: { min: 180000, max: 240000 } },
        { jobTitle: 'Senior React Developer', companyId: companyDocs['Stripe'], status: 'FINAL_INTERVIEW', priority: 'HIGH', location: 'Remote', workMode: 'REMOTE', salary: { min: 155000, max: 195000 } },
        { jobTitle: 'React Developer', companyId: companyDocs['Amazon'], status: 'OFFER', priority: 'MEDIUM', location: 'Austin, TX', workMode: 'REMOTE', salary: { min: 90000, max: 115000 } },
      ];

      for (const appData of applicationsSeed) {
        await Application.create({
          userId,
          ...appData,
          applicationDate: new Date(Date.now() - Math.floor(Math.random() * 20 + 1) * 24 * 3600 * 1000),
          lastActivityAt: new Date(),
          source: 'LinkedIn',
          timeline: [{ type: 'CREATION', title: 'Application Submitted', occurredAt: new Date() }],
          contacts: [{ name: 'Sarah J.', role: 'Senior Recruiter', email: 'recruiter@company.com' }]
        });
      }

      console.log('🌱 Seeded Demo Account dataset successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Seeding error:', error.message);
      return false;
    }
  }
};
