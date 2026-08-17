import Company from '../models/Company.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import Reminder from '../models/Reminder.js';
import EmailEvent from '../models/EmailEvent.js';
import AIAnalysis from '../models/AIAnalysis.js';

export const seedService = {
  seedDemoData: async (userId) => {
    try {
      console.log(`🌱 Seeding database with high-quality demo data for user: ${userId}...`);

      // 1. Clear existing user data (keep the user, clear their apps, interviews, reminders, emails)
      await Application.deleteMany({ userId });
      await Interview.deleteMany({ userId });
      await Reminder.deleteMany({ userId });
      await EmailEvent.deleteMany({ userId });
      await AIAnalysis.deleteMany({ userId });

      // Create companies (or find if they already exist, but reset them for demo consistency)
      await Company.deleteMany({}); // Delete all companies to avoid domain collisions
      
      const companySpecs = [
        { name: 'Google', domain: 'google.com', website: 'https://google.com', industry: 'Big Tech', headquarters: 'Mountain View, CA', size: '10000+ employees', foundedYear: 1998, healthScore: 88, layoffRisk: 12, factors: ['✓ Strong cash reserves', '✓ Active AI cloud scaling', '△ General Big-tech restructurings'] },
        { name: 'Microsoft', domain: 'microsoft.com', website: 'https://microsoft.com', industry: 'Big Tech', headquarters: 'Redmond, WA', size: '10000+ employees', foundedYear: 1975, healthScore: 90, layoffRisk: 10, factors: ['✓ Strong Azure growth', '✓ Lead investor in OpenAI', '✓ High enterprise software retention'] },
        { name: 'Amazon', domain: 'amazon.com', website: 'https://amazon.com', industry: 'E-commerce & Cloud', headquarters: 'Seattle, WA', size: '10000+ employees', foundedYear: 1994, healthScore: 82, layoffRisk: 18, factors: ['✓ AWS revenue margins', '✓ Logistics optimization dominance', '△ Shifting retail/warehouse margins'] },
        { name: 'Meta', domain: 'meta.com', website: 'https://meta.com', industry: 'Social Media / VR', headquarters: 'Menlo Park, CA', size: '10000+ employees', foundedYear: 2004, healthScore: 80, layoffRisk: 22, factors: ['✓ Record high ad-revenues', '✓ Strong open-source AI footprint', '△ Capital intensive VR hardware bets'] },
        { name: 'Stripe', domain: 'stripe.com', website: 'https://stripe.com', industry: 'Fintech', headquarters: 'San Francisco, CA', size: '5001-10000 employees', foundedYear: 2010, healthScore: 85, layoffRisk: 15, factors: ['✓ Core transaction volume leader', '✓ Strong engineering culture', '△ Global payments regulatory compliance risks'] },
        { name: 'Shopify', domain: 'shopify.com', website: 'https://shopify.com', industry: 'E-commerce SaaS', headquarters: 'Ottawa, Canada', size: '5001-10000 employees', foundedYear: 2006, healthScore: 78, layoffRisk: 20, factors: ['✓ Dominates SMB web-store platform space', '✓ Expansion into enterprise clients', '△ Inflation impact on consumer spending'] },
        { name: 'OpenAI', domain: 'openai.com', website: 'https://openai.com', industry: 'Artificial Intelligence', headquarters: 'San Francisco, CA', size: '1001-5000 employees', foundedYear: 2015, healthScore: 92, layoffRisk: 8, factors: ['✓ Generative AI product leader', '✓ Multi-billion backing from MSFT', '△ Extremely high GPU computing expenses'] },
        { name: 'Netflix', domain: 'netflix.com', website: 'https://netflix.com', industry: 'Streaming Entertainment', headquarters: 'Los Gatos, CA', size: '5001-10000 employees', foundedYear: 1997, healthScore: 76, layoffRisk: 24, factors: ['✓ Dominates SVOD market space', '✓ Password sharing crackdown success', '△ Rising local content productions costs'] },
        { name: 'Airbnb', domain: 'airbnb.com', website: 'https://airbnb.com', industry: 'Travel & Hospitality', headquarters: 'San Francisco, CA', size: '5001-10000 employees', foundedYear: 2008, healthScore: 74, layoffRisk: 26, factors: ['✓ Strong cash flows post-pandemic', '△ Global city regulatory headwinds', '△ Discretionary vacation spending slowdowns'] },
        { name: 'Tesla', domain: 'tesla.com', website: 'https://tesla.com', industry: 'Automotive & Energy', headquarters: 'Austin, TX', size: '10000+ employees', foundedYear: 2003, healthScore: 70, layoffRisk: 28, factors: ['✓ EV market volume leader', '△ Rising global competition (BYD)', '△ Margin contractions due to price cuts'] },
        { name: 'Startup XYZ', domain: 'startupxyz.io', website: 'https://startupxyz.io', industry: 'AI Developer Tools', headquarters: 'Austin, TX', size: '11-50 employees', foundedYear: 2023, healthScore: 60, layoffRisk: 35, factors: ['✓ Fast agility and development loops', '△ High runway burn rate', '△ Hard to compete with larger tech firms'] },
        { name: 'Fintech Spark', domain: 'fintechspark.co', website: 'https://fintechspark.co', industry: 'Fintech Payments', headquarters: 'New York, NY', size: '51-200 employees', foundedYear: 2021, healthScore: 68, layoffRisk: 30, factors: ['✓ Stable regional niche volume', '△ Raising Series B in tough funding market'] },
      ];

      const companyDocs = await Company.insertMany(companySpecs);

      // Maps company name to ObjectId
      const companyMap = {};
      companyDocs.forEach(c => {
        companyMap[c.name] = c._id;
      });

      // 2. Prepare Applications
      // We need 42 applications total
      // Statuses: 
      // SAVED (2), APPLIED (12), SCREENING (4), ASSESSMENT (3), INTERVIEW (6), FINAL_INTERVIEW (2), OFFER (2), ACCEPTED (1), REJECTED (10), WITHDRAWN (3), GHOSTED (7)
      // This is a highly complete MERN seed! Let's write them.
      const appSpecs = [];

      // Google - INTERVIEW
      appSpecs.push({
        userId,
        companyId: companyMap['Google'],
        jobTitle: 'Frontend Software Engineer',
        jobUrl: 'https://careers.google.com/jobs/results/frontend-dev',
        source: 'Referral',
        location: 'Mountain View, CA',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        salary: { min: 140000, max: 185000, currency: 'USD' },
        status: 'INTERVIEW',
        priority: 'HIGH',
        applicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        resumeUsed: 'Resume_Frontend_2026_V2.pdf',
        coverLetterUsed: 'Google Cover Letter.pdf',
        notes: 'Referred by senior engineer in Search. Prepare React profiling and tree questions.',
        tags: ['React', 'TypeScript', 'Search Team'],
        contacts: [{ name: 'Sarah Johnson', role: 'Technical Recruiter', email: 's.johnson@google.com', linkedin: 'https://linkedin.com/in/sarah-j-recruiter' }],
        timeline: [
          { type: 'CREATION', title: 'Application Drafted', description: 'Saved from referral link', occurredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to APPLIED', description: 'Referral submitted officially', occurredAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
          { type: 'EMAIL_RECEIVED', title: 'Recruiter Contacted', description: 'Sarah Johnson scheduled a phone screen', occurredAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to SCREENING', description: 'Transitioned to HR review', occurredAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
          { type: 'NOTE', title: 'Phone Screen Completed', description: 'Talked about experience and salary benchmarks', occurredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to INTERVIEW', description: 'Scheduled Technical Loop', occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Microsoft - SCREENING
      appSpecs.push({
        userId,
        companyId: companyMap['Microsoft'],
        jobTitle: 'Software Engineering Intern',
        jobUrl: 'https://careers.microsoft.com/jobs/swe-intern',
        source: 'LinkedIn',
        location: 'Redmond, WA',
        workMode: 'ON_SITE',
        employmentType: 'INTERNSHIP',
        salary: { min: 45, max: 60, currency: 'USD' }, // hourly rate
        status: 'SCREENING',
        priority: 'HIGH',
        applicationDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        resumeUsed: 'Resume_General_2026.pdf',
        notes: 'Recruiter reached out via LinkedIn. HR phone screen tomorrow.',
        tags: ['Internship', 'C#', 'Redmond'],
        contacts: [{ name: 'David Miller', role: 'University Recruiter', email: 'd.miller@microsoft.com' }],
        timeline: [
          { type: 'CREATION', title: 'Application Logged', description: 'Imported from LinkedIn', occurredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
          { type: 'EMAIL_RECEIVED', title: 'Recruiter Email', description: 'Invited to schedule phone screen', occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to SCREENING', description: 'Transitioned to screening', occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        ],
      });

      // OpenAI - ASSESSMENT
      appSpecs.push({
        userId,
        companyId: companyMap['OpenAI'],
        jobTitle: 'Full Stack Engineer (API Team)',
        jobUrl: 'https://openai.com/careers/full-stack-api',
        source: 'Company Website',
        location: 'San Francisco, CA',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        salary: { min: 180000, max: 240000, currency: 'USD' },
        status: 'ASSESSMENT',
        priority: 'HIGH',
        applicationDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        resumeUsed: 'Resume_FullStack_2026.pdf',
        notes: 'Sent a HackerRank coding challenge. 3 hour limit. Focus on node.js stream processing.',
        tags: ['React', 'Node.js', 'HackerRank'],
        timeline: [
          { type: 'CREATION', title: 'Application Created', description: 'Applied via Greenhouse', occurredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
          { type: 'EMAIL_RECEIVED', title: 'Take Home Test Sent', description: 'Coding challenge links delivered', occurredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to ASSESSMENT', description: 'Moved to coding phase', occurredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Stripe - FINAL_INTERVIEW
      appSpecs.push({
        userId,
        companyId: companyMap['Stripe'],
        jobTitle: 'Senior React Developer',
        jobUrl: 'https://stripe.com/jobs/react-dev',
        source: 'Indeed',
        location: 'Remote',
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        salary: { min: 155000, max: 195000, currency: 'USD' },
        status: 'FINAL_INTERVIEW',
        priority: 'HIGH',
        applicationDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        resumeUsed: 'Resume_Frontend_2026_V2.pdf',
        notes: 'Finished technical panel. Waiting on response for the final culture fit session.',
        tags: ['React', 'Remote', 'Payments'],
        contacts: [{ name: 'Emily White', role: 'Lead Talent Partner', email: 'emily.w@stripe.com' }],
        timeline: [
          { type: 'CREATION', title: 'Applied', occurredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to SCREENING', occurredAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to INTERVIEW', occurredAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) },
          { type: 'NOTE', title: 'Coding & Architecture Round', description: 'Discussed design of billing frontends', occurredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to FINAL_INTERVIEW', description: 'Panel schedule confirmed', occurredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Startup XYZ - OFFER
      appSpecs.push({
        userId,
        companyId: companyMap['Startup XYZ'],
        jobTitle: 'React Developer',
        jobUrl: 'https://startupxyz.io/jobs/react',
        source: 'Wellfound',
        location: 'Austin, TX',
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        salary: { min: 80000, max: 100000, currency: 'USD' },
        status: 'OFFER',
        priority: 'MEDIUM',
        applicationDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        resumeUsed: 'Resume_Frontend_2026_V2.pdf',
        notes: 'Received an offer of $85,000. Plan to negotiate to $95,000 using the AI salary assistant.',
        tags: ['React', 'Startup', 'Offer'],
        contacts: [{ name: 'Alex River', role: 'Co-Founder', email: 'alex@startupxyz.io' }],
        timeline: [
          { type: 'CREATION', title: 'Applied on Wellfound', occurredAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Technical Interview', occurredAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
          { type: 'EMAIL_RECEIVED', title: 'Offer Letter Delivered', description: 'Offer amount: $85k, equity: 0.1%', occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Status updated to OFFER', occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Fintech Spark - OFFER (Declined/Accepted flow or another offer)
      appSpecs.push({
        userId,
        companyId: companyMap['Fintech Spark'],
        jobTitle: 'Software Engineer',
        jobUrl: 'https://fintechspark.co/careers/swe',
        source: 'Indeed',
        location: 'New York, NY',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        salary: { min: 90000, max: 115000, currency: 'USD' },
        status: 'OFFER',
        priority: 'MEDIUM',
        applicationDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        notes: 'Received offer of $110,000. Evaluating remote vs hybrid tradeoffs.',
        tags: ['Node.js', 'Fintech'],
        timeline: [
          { type: 'CREATION', title: 'Applied via Indeed', occurredAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Moved to Interviews', occurredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Received Offer', occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Netflix - REJECTED
      appSpecs.push({
        userId,
        companyId: companyMap['Netflix'],
        jobTitle: 'Frontend Engineer (Growth)',
        source: 'LinkedIn',
        location: 'Los Gatos, CA',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        salary: { min: 160000, max: 210000, currency: 'USD' },
        status: 'REJECTED',
        priority: 'MEDIUM',
        applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: 'Rejected after first technical panel. They wanted deeper systems designs knowledge.',
        tags: ['React', 'Netflix'],
        timeline: [
          { type: 'CREATION', title: 'Applied via LinkedIn', occurredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Phone Screen Passed', occurredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Technical Panel Rejected', occurredAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Amazon - GHOSTED
      appSpecs.push({
        userId,
        companyId: companyMap['Amazon'],
        jobTitle: 'Software Development Engineer I',
        source: 'Company Website',
        location: 'Seattle, WA',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        salary: { min: 120000, max: 155000, currency: 'USD' },
        status: 'GHOSTED',
        priority: 'MEDIUM',
        applicationDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        notes: 'No response after submitting online application 40 days ago.',
        tags: ['Java', 'Cloud'],
        timeline: [
          { type: 'CREATION', title: 'Applied via Portal', occurredAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Meta - REJECTED
      appSpecs.push({
        userId,
        companyId: companyMap['Meta'],
        jobTitle: 'Product Engineer',
        source: 'Referral',
        location: 'Menlo Park, CA',
        workMode: 'HYBRID',
        status: 'REJECTED',
        priority: 'HIGH',
        applicationDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        notes: 'Rejected on CV screening.',
        timeline: [
          { type: 'CREATION', title: 'Referral Submitted', occurredAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Rejected on Screen', occurredAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Airbnb - WITHDRAWN
      appSpecs.push({
        userId,
        companyId: companyMap['Airbnb'],
        jobTitle: 'Software Engineer - Fullstack',
        source: 'Company Website',
        location: 'San Francisco, CA',
        workMode: 'REMOTE',
        status: 'WITHDRAWN',
        priority: 'MEDIUM',
        applicationDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        notes: 'Withdrew application after receiving other local offers in Austin.',
        timeline: [
          { type: 'CREATION', title: 'Applied', occurredAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000) },
          { type: 'STATUS_CHANGE', title: 'Withdrew', occurredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
        ],
      });

      // Add remaining basic applications to reach a total of 42
      // We will loop to seed more apps across APPLIED, SAVED, GHOSTED, REJECTED to populate dashboard charts.
      const extraCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Stripe', 'Shopify', 'Netflix', 'Tesla', 'Airbnb'];
      const extraRoles = ['Software Engineer', 'React Developer', 'Frontend Dev', 'Node Engineer', 'Full Stack Developer'];
      const extraStatuses = ['APPLIED', 'SAVED', 'GHOSTED', 'REJECTED', 'WITHDRAWN'];
      const extraSources = ['LinkedIn', 'Indeed', 'Company Website', 'Wellfound'];

      for (let i = 0; i < 32; i++) {
        const compName = extraCompanies[i % extraCompanies.length];
        const status = extraStatuses[i % extraStatuses.length];
        const role = extraRoles[i % extraRoles.length];
        const source = extraSources[i % extraSources.length];
        const days = 10 + i * 2; // spaced out dates
        
        appSpecs.push({
          userId,
          companyId: companyMap[compName],
          jobTitle: `${role} - Team ${String.fromCharCode(65 + (i % 6))}`,
          source,
          location: 'Remote',
          workMode: 'REMOTE',
          salary: { min: 80000 + (i * 2000), max: 110000 + (i * 2500), currency: 'USD' },
          status,
          priority: i % 3 === 0 ? 'HIGH' : 'MEDIUM',
          applicationDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          lastActivityAt: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          notes: 'Automated seed application for metrics validation.',
          timeline: [
            { type: 'CREATION', title: 'Logged application', occurredAt: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
          ],
        });
      }

      // Insert all 42 applications
      const insertedApps = await Application.insertMany(appSpecs);

      // 3. Seed Interviews
      // We need 8 interviews
      // Let's find applications that are in SCREENING, INTERVIEW, or FINAL_INTERVIEW stages
      const interviewApps = insertedApps.filter(a => ['SCREENING', 'INTERVIEW', 'FINAL_INTERVIEW'].includes(a.status));
      const interviewSpecs = [];

      // Google Technical Interview (scheduled in 2 days)
      const googleApp = interviewApps.find(a => a.jobTitle.includes('Frontend Software Engineer') && a.status === 'INTERVIEW');
      if (googleApp) {
        const inTwoDays = new Date();
        inTwoDays.setDate(inTwoDays.getDate() + 2);
        inTwoDays.setHours(14, 0, 0, 0);

        interviewSpecs.push({
          userId,
          applicationId: googleApp._id,
          type: 'TECHNICAL',
          scheduledAt: inTwoDays,
          duration: 60,
          interviewer: 'David G. (L6 Staff Eng)',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          location: 'Google Meet',
          notes: 'Focus on coding optimization, runtime complexities, and DOM layout cycles.',
        });
      }

      // Microsoft Phone Screen (scheduled tomorrow)
      const msftApp = interviewApps.find(a => a.jobTitle.includes('Intern') && a.status === 'SCREENING');
      if (msftApp) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(11, 30, 0, 0);

        interviewSpecs.push({
          userId,
          applicationId: msftApp._id,
          type: 'PHONE_SCREEN',
          scheduledAt: tomorrow,
          duration: 30,
          interviewer: 'David Miller',
          meetingUrl: 'https://teams.microsoft.com/meet/12345',
          location: 'Microsoft Teams',
          notes: 'Standard fit questions, project review, and internship timeline parameters.',
        });
      }

      // Stripe Final Interview Panel (scheduled in 5 days)
      const stripeApp = interviewApps.find(a => a.jobTitle.includes('Senior React Developer'));
      if (stripeApp) {
        const inFiveDays = new Date();
        inFiveDays.setDate(inFiveDays.getDate() + 5);
        inFiveDays.setHours(9, 0, 0, 0);

        interviewSpecs.push({
          userId,
          applicationId: stripeApp._id,
          type: 'PANEL',
          scheduledAt: inFiveDays,
          duration: 180,
          interviewer: 'Emily White + Billing Frontend Team',
          meetingUrl: 'https://zoom.us/j/987654321',
          location: 'Zoom',
          notes: '3 back-to-back 45-min rounds (React UI design, Architecture, Behavioral).',
        });
      }

      // Add 5 past/completed or pending interviews to make 8 total
      for (let idx = 0; idx < 5; idx++) {
        const app = insertedApps[idx % insertedApps.length];
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - (idx + 1) * 3);
        
        interviewSpecs.push({
          userId,
          applicationId: app._id,
          type: idx % 2 === 0 ? 'BEHAVIORAL' : 'TECHNICAL',
          scheduledAt: pastDate,
          duration: 45,
          interviewer: 'Recruiting Lead',
          location: 'Phone Call',
          notes: `Simulated interview #${idx + 1}`,
          result: idx % 2 === 0 ? 'PASSED' : 'FAILED',
          feedback: idx % 2 === 0 ? 'Candidate excelled in core coding paradigms.' : 'Lacked sufficient backend experience.',
        });
      }

      await Interview.insertMany(interviewSpecs);

      // 4. Seed Reminders
      // Completed and uncompleted reminders
      const reminderSpecs = [
        { userId, applicationId: googleApp?._id, type: 'PREPARE_INTERVIEW', title: 'Prepare React architecture and profiling', description: 'Review react fiber, rendering, scheduler.', dueAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), completed: false },
        { userId, applicationId: msftApp?._id, type: 'FOLLOW_UP', title: 'Prep Microsoft intro pitches', description: 'Focus on projects and why MSFT.', dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000), completed: false },
        { userId, applicationId: stripeApp?._id, type: 'CHECK_STATUS', title: 'Follow up with Emily regarding panel feedback', description: 'Send email asking for details.', dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: false }, // Overdue
        { userId, applicationId: googleApp?._id, type: 'SEND_THANK_YOU', title: 'Send thank you email to phone screener', description: 'Draft thank you card.', dueAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), completed: true },
      ];

      await Reminder.insertMany(reminderSpecs);

      // 5. Seed Email Events (unprocessed so user can interact with them)
      const emailSpecs = [
        {
          userId,
          provider: 'SIMULATION',
          messageId: 'sim-email-001',
          sender: 'careers@google.com',
          subject: 'Google Application Received - Frontend Developer',
          bodyPreview: 'Dear Nabil, Thank you for applying for the Frontend Developer position at Google. We have received your application and our recruiting team is currently reviewing your qualifications.',
          receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          extractedData: { company: 'Google', jobTitle: 'Frontend Developer', applicationStatus: 'APPLIED', recruiterEmail: 'careers@google.com' },
          confidence: 0.98,
          processed: false,
        },
        {
          userId,
          provider: 'SIMULATION',
          messageId: 'sim-email-002',
          sender: 'recruitment@microsoft.com',
          subject: 'Microsoft Interview Invitation: SWE Intern',
          bodyPreview: 'Hi Nabil, We were impressed by your profile. We would like to invite you for a 45-minute technical video screen to discuss your background and solve a coding challenge. Please schedule a time here.',
          receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          extractedData: { company: 'Microsoft', jobTitle: 'SWE Intern', applicationStatus: 'INTERVIEW', recruiterEmail: 'recruitment@microsoft.com' },
          confidence: 0.95,
          processed: false,
        },
        {
          userId,
          provider: 'SIMULATION',
          messageId: 'sim-email-003',
          sender: 'hr@openai.com',
          subject: 'OpenAI Assessment: Coding Challenge',
          bodyPreview: 'Hello candidate, Please find link to your OpenAI technical coding assessment on HackerRank. You have 3 days to complete this assessment from today.',
          receivedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          extractedData: { company: 'OpenAI', jobTitle: 'Full Stack Engineer', applicationStatus: 'ASSESSMENT', recruiterEmail: 'hr@openai.com' },
          confidence: 0.92,
          processed: false,
        },
      ];

      await EmailEvent.insertMany(emailSpecs);

      // 6. Cache AI Analyses
      const analysisSpecs = [
        {
          userId,
          applicationId: googleApp?._id,
          type: 'INTERVIEW_PROBABILITY',
          score: 72,
          result: 'Strong Match',
          factors: ['✓ React matches job description', '✓ TypeScript experience', '✓ Good referral weight', '△ Limited production infrastructure experience'],
          recommendations: ['Review web performance profiles', 'Highlight system optimization details in interview'],
        },
        {
          userId,
          applicationId: stripeApp?._id,
          type: 'INTERVIEW_PROBABILITY',
          score: 84,
          result: 'Strong Match',
          factors: ['✓ Senior developer skills', '✓ Payment gateway integrations history', '✓ Strong system design performance', '△ Located remotely (cross-timezone logistics)'],
          recommendations: ['Discuss async communications styles', 'Showcase Stripe payment API projects'],
        },
      ];

      await AIAnalysis.insertMany(analysisSpecs);

      console.log('🌱 Database seeded successfully!');
    } catch (err) {
      console.error('❌ Database seeding failed:', err.message);
      throw err;
    }
  },
};
export default seedService;
