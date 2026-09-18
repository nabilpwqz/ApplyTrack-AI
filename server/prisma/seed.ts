import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with exact ApplyTrack AI initial data...');

  // 1. Create Default Admin & Demo User
  const adminPasswordHash = await bcrypt.hash('change-me-strong-password', 10);
  const demoPasswordHash = await bcrypt.hash('change-me-demo-password', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      provider: 'email',
      plan: 'premium',
      status: 'active',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo.user@example.com' },
    update: {},
    create: {
      email: 'demo.user@example.com',
      name: 'Demo User',
      passwordHash: demoPasswordHash,
      role: 'USER',
      provider: 'email',
      plan: 'free',
      status: 'active',
    },
  });

  // Admin users for moderation panel
  const platformUsers = [
    { name: 'Demo Admin', email: 'admin.one@example.com', plan: 'premium', status: 'active' },
    { name: 'Demo Manager', email: 'manager.one@example.com', plan: 'free', status: 'active' },
    { name: 'Demo Reviewer', email: 'reviewer.one@example.com', plan: 'premium', status: 'suspended' },
    { name: 'Demo Operator', email: 'operator.one@example.com', plan: 'premium', status: 'active' },
  ];

  for (const u of platformUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash: demoPasswordHash,
        role: 'USER',
        provider: 'email',
        plan: u.plan,
        status: u.status,
      },
    });
  }

  // 2. Clear previous applications & related data for demoUser to prevent duplicate seeds
  await prisma.timelineEvent.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.networkContact.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.emailImport.deleteMany({});
  await prisma.careerGoal.deleteMany({});
  await prisma.billingTransaction.deleteMany({});
  await prisma.subscription.deleteMany({});

  const today = new Date();
  const d = (daysAgo: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - daysAgo);
    return dt.toISOString().split('T')[0];
  };
  const future = (daysAhead: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + daysAhead);
    return dt.toISOString().split('T')[0];
  };

  // 3. Applications Data
  const seedApplications = [
    {
      id: 1,
      userId: demoUser.id,
      company: 'Google',
      title: 'Senior Frontend Developer',
      url: 'https://careers.google.com',
      location: 'Mountain View, CA',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      salaryMin: 145000,
      salaryMax: 190000,
      applicationDate: d(14),
      deadline: future(15),
      source: 'Referral',
      priority: 'High',
      status: 'interview',
      notes: 'Referred by John. Great team culture. 3 rounds completed.',
      recruiterName: 'Demo Recruiter',
      recruiterEmail: 'recruiter@example.com',
      resumeVersion: 'v3',
      tags: ['frontend', 'react', 'google'],
      timeline: [
        { date: d(14), event: 'Application submitted', type: 'submitted' },
        { date: d(10), event: 'Recruiter contacted for screening', type: 'contact' },
        { date: d(7), event: 'Phone screening completed', type: 'screening' },
        { date: d(3), event: 'Technical interview scheduled', type: 'interview' },
      ],
    },
    {
      id: 2,
      userId: demoUser.id,
      company: 'Microsoft',
      title: 'Full Stack Engineer',
      url: 'https://careers.microsoft.com',
      location: 'Redmond, WA',
      workMode: 'Remote',
      employmentType: 'Full-time',
      salaryMin: 130000,
      salaryMax: 175000,
      applicationDate: d(7),
      deadline: future(21),
      source: 'LinkedIn',
      priority: 'Medium',
      status: 'applied',
      notes: 'Applied through LinkedIn Easy Apply. .NET stack.',
      recruiterName: '',
      recruiterEmail: '',
      resumeVersion: 'v2',
      tags: ['fullstack', 'remote', 'microsoft'],
      timeline: [{ date: d(7), event: 'Application submitted via LinkedIn', type: 'submitted' }],
    },
    {
      id: 3,
      userId: demoUser.id,
      company: 'Stripe',
      title: 'Product Engineer',
      url: 'https://stripe.com/jobs',
      location: 'San Francisco, CA',
      workMode: 'Remote',
      employmentType: 'Full-time',
      salaryMin: 155000,
      salaryMax: 220000,
      applicationDate: d(5),
      deadline: future(30),
      source: 'Company Website',
      priority: 'High',
      status: 'screening',
      notes: 'Strong match with React + TypeScript.',
      recruiterName: 'Demo Recruiter',
      recruiterEmail: 'recruiter@example.com',
      resumeVersion: 'v3',
      tags: ['react', 'typescript', 'fintech'],
      timeline: [
        { date: d(5), event: 'Application submitted', type: 'submitted' },
        { date: d(2), event: 'Recruiter screening scheduled', type: 'screening' },
      ],
    },
    {
      id: 4,
      userId: demoUser.id,
      company: 'Netflix',
      title: 'UI Engineer',
      url: 'https://jobs.netflix.com',
      location: 'Los Gatos, CA',
      workMode: 'On-site',
      employmentType: 'Full-time',
      salaryMin: 165000,
      salaryMax: 230000,
      applicationDate: d(21),
      deadline: future(10),
      source: 'Referral',
      priority: 'High',
      status: 'final_interview',
      notes: 'Final round scheduled. Preparing system design.',
      recruiterName: 'Demo Recruiter',
      recruiterEmail: 'recruiter@example.com',
      resumeVersion: 'v3',
      tags: ['ui', 'javascript', 'netflix'],
      timeline: [
        { date: d(21), event: 'Application submitted', type: 'submitted' },
        { date: d(16), event: 'Screening call', type: 'screening' },
        { date: d(12), event: 'Technical interview 1', type: 'interview' },
        { date: d(6), event: 'Technical interview 2', type: 'interview' },
        { date: d(1), event: 'Final interview scheduled', type: 'final' },
      ],
    },
    {
      id: 5,
      userId: demoUser.id,
      company: 'Airbnb',
      title: 'React Developer',
      url: 'https://careers.airbnb.com',
      location: 'Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
      salaryMin: 120000,
      salaryMax: 160000,
      applicationDate: d(35),
      deadline: future(5),
      source: 'Job Board',
      priority: 'Medium',
      status: 'rejected',
      notes: 'Rejected after first round. Feedback: need more experience.',
      recruiterName: 'Tom Wilson',
      recruiterEmail: 'tom.wilson@airbnb.com',
      resumeVersion: 'v2',
      tags: ['react', 'remote'],
      timeline: [
        { date: d(35), event: 'Application submitted', type: 'submitted' },
        { date: d(28), event: 'Recruiter screening', type: 'screening' },
        { date: d(20), event: 'Technical interview', type: 'interview' },
        { date: d(10), event: 'Rejection received', type: 'rejected' },
      ],
    },
    {
      id: 6,
      userId: demoUser.id,
      company: 'Shopify',
      title: 'Senior JavaScript Developer',
      url: 'https://www.shopify.com/careers',
      location: 'Ottawa, Canada',
      workMode: 'Remote',
      employmentType: 'Full-time',
      salaryMin: 110000,
      salaryMax: 150000,
      applicationDate: d(3),
      deadline: future(25),
      source: 'LinkedIn',
      priority: 'Low',
      status: 'saved',
      notes: 'Considering. Company culture seems great.',
      recruiterName: '',
      recruiterEmail: '',
      resumeVersion: 'v2',
      tags: ['javascript', 'remote', 'ecommerce'],
      timeline: [{ date: d(3), event: 'Added to tracker', type: 'saved' }],
    },
    {
      id: 7,
      userId: demoUser.id,
      company: 'Spotify',
      title: 'Web Engineer',
      url: 'https://lifeatspotify.com/jobs',
      location: 'New York, NY',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      salaryMin: 135000,
      salaryMax: 185000,
      applicationDate: d(9),
      deadline: future(18),
      source: 'Company Website',
      priority: 'High',
      status: 'assessment',
      notes: 'Technical assessment in progress. Due in 5 days.',
      recruiterName: 'Anna Kim',
      recruiterEmail: 'anna.kim@spotify.com',
      resumeVersion: 'v3',
      tags: ['web', 'javascript', 'music'],
      timeline: [
        { date: d(9), event: 'Application submitted', type: 'submitted' },
        { date: d(4), event: 'Screening completed', type: 'screening' },
        { date: d(1), event: 'Technical assessment sent', type: 'assessment' },
      ],
    },
    {
      id: 8,
      userId: demoUser.id,
      company: 'Figma',
      title: 'Frontend Platform Engineer',
      url: 'https://www.figma.com/careers',
      location: 'San Francisco, CA',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      salaryMin: 140000,
      salaryMax: 200000,
      applicationDate: d(2),
      deadline: future(28),
      source: 'Recruiter',
      priority: 'High',
      status: 'applied',
      notes: 'Recruiter reached out. Strong fit with design systems.',
      recruiterName: 'David Lee',
      recruiterEmail: 'david.lee@figma.com',
      resumeVersion: 'v3',
      tags: ['frontend', 'design-systems', 'figma'],
      timeline: [
        { date: d(2), event: 'Application submitted', type: 'submitted' },
        { date: d(0), event: 'Recruiter responded', type: 'contact' },
      ],
    },
    {
      id: 9,
      userId: demoUser.id,
      company: 'Uber',
      title: 'Software Engineer II',
      url: 'https://www.uber.com/careers',
      location: 'Remote',
      workMode: 'Remote',
      employmentType: 'Full-time',
      salaryMin: 125000,
      salaryMax: 170000,
      applicationDate: d(12),
      deadline: future(20),
      source: 'LinkedIn',
      priority: 'Medium',
      status: 'interview',
      notes: 'Interview round 2 next week.',
      recruiterName: 'Lisa Park',
      recruiterEmail: 'lisa.park@uber.com',
      resumeVersion: 'v2',
      tags: ['backend', 'golang', 'remote'],
      timeline: [
        { date: d(12), event: 'Application submitted', type: 'submitted' },
        { date: d(6), event: 'Screening completed', type: 'screening' },
        { date: d(2), event: 'Interview round 1 completed', type: 'interview' },
      ],
    },
    {
      id: 10,
      userId: demoUser.id,
      company: 'Adobe',
      title: 'UI Developer',
      url: 'https://www.adobe.com/careers',
      location: 'San Jose, CA',
      workMode: 'On-site',
      employmentType: 'Full-time',
      salaryMin: 115000,
      salaryMax: 160000,
      applicationDate: d(18),
      deadline: future(8),
      source: 'Job Board',
      priority: 'Low',
      status: 'withdrawn',
      notes: 'Withdrew due to location preference.',
      recruiterName: 'Chris Brown',
      recruiterEmail: 'chris.brown@adobe.com',
      resumeVersion: 'v1',
      tags: ['ui', 'adobe'],
      timeline: [
        { date: d(18), event: 'Application submitted', type: 'submitted' },
        { date: d(8), event: 'Withdrew application', type: 'withdrawn' },
      ],
    },
  ];

  for (const app of seedApplications) {
    const { timeline, ...appData } = app;
    await prisma.application.create({
      data: {
        ...appData,
        timeline: {
          create: timeline,
        },
      },
    });
  }

  // 4. Email Imports
  const emailImports = [
    {
      id: 101,
      userId: demoUser.id,
      company: 'Amazon',
      title: 'Frontend Engineer',
      source: 'email',
      status: 'pending',
      detectedDate: d(0),
      confidence: 'High',
      emailSubject: 'Application Confirmation - Amazon',
      extractData: JSON.stringify({
        company: 'Amazon',
        title: 'Frontend Engineer',
        status: 'applied',
        recruiterName: 'Rachel Lee',
        recruiterEmail: 'rachel.lee@amazon.com',
      }),
    },
    {
      id: 102,
      userId: demoUser.id,
      company: 'Slack',
      title: 'Software Developer',
      source: 'email',
      status: 'pending',
      detectedDate: d(1),
      confidence: 'Medium',
      emailSubject: 'Interview Invitation - Slack',
      extractData: JSON.stringify({
        company: 'Slack',
        title: 'Software Developer',
        status: 'interview',
        recruiterName: 'Sam Patel',
        recruiterEmail: 'sam.patel@slack.com',
      }),
    },
    {
      id: 103,
      userId: demoUser.id,
      company: 'Canva',
      title: 'Frontend Engineer',
      source: 'email',
      status: 'pending',
      detectedDate: d(2),
      confidence: 'High',
      emailSubject: 'Application Received - Canva',
      extractData: JSON.stringify({
        company: 'Canva',
        title: 'Frontend Engineer',
        status: 'applied',
        recruiterName: '',
        recruiterEmail: '',
      }),
    },
  ];

  for (const item of emailImports) {
    await prisma.emailImport.create({ data: item });
  }

  // 5. Network Contacts
  const contacts = [
    {
      id: 1,
      userId: demoUser.id,
      name: 'Demo Recruiter',
      role: 'Recruiter',
      company: 'Example Tech',
      email: 'recruiter@example.com',
      notes: 'Initial outreach; follow up after review window.',
      lastTouch: '2026-08-30',
    },
    {
      id: 2,
      userId: demoUser.id,
      name: 'Demo Hiring Manager',
      role: 'Hiring manager',
      company: 'Example Platform',
      email: 'hiring.manager@example.com',
      notes: 'Asked for a portfolio review; send updated case study.',
      lastTouch: '2026-08-28',
    },
    {
      id: 3,
      userId: demoUser.id,
      name: 'Demo Referral',
      role: 'Referral',
      company: 'Example Cloud',
      email: 'referral@example.com',
      notes: 'Connected to the team; shared hiring signal.',
      lastTouch: '2026-08-25',
    },
    {
      id: 4,
      userId: demoUser.id,
      name: 'Demo Mentor',
      role: 'Peer',
      company: 'Example Design',
      email: 'mentor@example.com',
      notes: 'Peer mentor from product org; review loop prep.',
      lastTouch: '2026-08-26',
    },
  ];

  for (const contact of contacts) {
    await prisma.networkContact.create({ data: contact });
  }

  // 6. Story Bank
  const stories = [
    {
      id: 1,
      userId: demoUser.id,
      title: 'Led a 6-week design-system migration',
      tags: ['leadership', 'design systems', 'execution'],
      situation: 'Our team had three separate design libraries and inconsistent patterns across product surfaces.',
      task: 'I needed to unify the system, reduce duplication and help teams ship with less friction.',
      action: 'I mapped the library overlap, prioritized the highest-impact tokens and components and partnered with designers to codify the migration plan.',
      result: 'We cut duplicated UI work by 42%, improved consistency and shipped the new system in under six weeks.',
    },
    {
      id: 2,
      userId: demoUser.id,
      title: 'Recovered a stalled launch with cross-functional clarity',
      tags: ['ownership', 'communication', 'delivery'],
      situation: 'A launch was slipping because engineering, product and QA were working from different assumptions.',
      task: 'I had to create alignment quickly and reduce the risk of a missed release window.',
      action: 'I set a single tracking view, clarified ownership and created a short daily update that surfaced blockers and decisions.',
      result: 'We brought the team back on track, cut blocker time dramatically and launched on time.',
    },
  ];

  for (const story of stories) {
    await prisma.story.create({ data: story });
  }

  // 7. Career Goals
  await prisma.careerGoal.create({
    data: {
      userId: demoUser.id,
      weeklyApplications: 5,
      weeklyInterviews: 2,
      targetRole: 'Staff Frontend Engineer',
      targetDate: future(90),
      notes: 'Focus on high-leverage product teams with strong design engineering culture.',
      streak: 3,
      lastWeekKey: '2026-W35',
    },
  });

  // 8. Default Subscriptions and Billing Transactions
  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      plan: 'free',
      status: 'approved',
      method: 'International payment',
      amount: '19.00',
      currency: 'USD',
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
