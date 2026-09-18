import { graphQLRequest, QUERIES } from '../api/graphqlClient';
import {
  Application,
  CareerGoals,
  EmailImport,
  NetworkContact,
  StoryItem,
  UserSession,
} from '../types';

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  saved: { label: 'Saved', color: '#78716c', bg: '#f5f5f4' },
  applied: { label: 'Applied', color: '#2563eb', bg: '#eff6ff' },
  screening: { label: 'Screening', color: '#2563eb', bg: '#eff6ff' },
  assessment: { label: 'Assessment', color: '#475569', bg: '#f8fafc' },
  interview: { label: 'Interview', color: '#2563eb', bg: '#eff6ff' },
  final_interview: { label: 'Final Interview', color: '#334155', bg: '#f1f5f9' },
  offer: { label: 'Offer', color: '#1d4ed8', bg: '#eff6ff' },
  accepted: { label: 'Accepted', color: '#1d4ed8', bg: '#dbeafe' },
  rejected: { label: 'Rejected', color: '#9ca3af', bg: '#f9fafb' },
  withdrawn: { label: 'Withdrawn', color: '#6b7280', bg: '#f3f4f6' },
};

export const KANBAN_COLUMNS = [
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'screening', label: 'Screening' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'interview', label: 'Interview' },
  { key: 'final_interview', label: 'Final' },
  { key: 'offer', label: 'Offer' },
];

export const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  High: { color: '#334155', bg: '#f1f5f9' },
  Medium: { color: '#475569', bg: '#f8fafc' },
  Low: { color: '#1d4ed8', bg: '#eff6ff' },
};

export const PREP_ITEMS = [
  'Research company & culture',
  'Review job description',
  'Prepare STAR stories',
  'Technical / case prep',
  'Questions for interviewer',
  'Test AV & environment',
];

export const PREP_KEY = 'interviewPrep';

export interface AppState {
  applications: Application[];
  emailImports: EmailImport[];
  careerGoals: CareerGoals;
  networkContacts: NetworkContact[];
  storyBank: StoryItem[];
  currentView: string;
  calendarMonth: number;
  calendarYear: number;
  editingId: number | null;
  session: UserSession | null;
}

export const state: AppState = {
  applications: [],
  emailImports: [],
  careerGoals: {
    weeklyApplications: 5,
    weeklyInterviews: 2,
    targetRole: '',
    targetDate: '',
    notes: '',
    streak: 0,
    lastWeekKey: '',
  },
  networkContacts: [
    {
      id: 1,
      name: 'Demo Recruiter',
      role: 'Recruiter',
      company: 'Example Tech',
      email: 'recruiter@example.com',
      notes: 'Initial outreach; follow up after review window.',
      lastTouch: '2026-08-30',
    },
    {
      id: 2,
      name: 'Demo Hiring Manager',
      role: 'Hiring manager',
      company: 'Example Platform',
      email: 'hiring.manager@example.com',
      notes: 'Asked for a portfolio review; send updated case study.',
      lastTouch: '2026-08-28',
    },
    {
      id: 3,
      name: 'Demo Referral',
      role: 'Referral',
      company: 'Example Cloud',
      email: 'referral@example.com',
      notes: 'Connected to the team; shared hiring signal.',
      lastTouch: '2026-08-25',
    },
    {
      id: 4,
      name: 'Demo Mentor',
      role: 'Peer',
      company: 'Example Design',
      email: 'mentor@example.com',
      notes: 'Peer mentor from product org; review loop prep.',
      lastTouch: '2026-08-26',
    },
  ],
  storyBank: [
    {
      id: 1,
      title: 'Led a 6-week design-system migration',
      tags: ['leadership', 'design systems', 'execution'],
      situation:
        'Our team had three separate design libraries and inconsistent patterns across product surfaces.',
      task: 'I needed to unify the system, reduce duplication and help teams ship with less friction.',
      action:
        'I mapped the library overlap, prioritized the highest-impact tokens and components and partnered with designers to codify the migration plan.',
      result:
        'We cut duplicated UI work by 42%, improved consistency and shipped the new system in under six weeks.',
    },
    {
      id: 2,
      title: 'Recovered a stalled launch with cross-functional clarity',
      tags: ['ownership', 'communication', 'delivery'],
      situation:
        'A launch was slipping because engineering, product and QA were working from different assumptions.',
      task: 'I had to create alignment quickly and reduce the risk of a missed release window.',
      action:
        'I set a single tracking view, clarified ownership and created a short daily update that surfaced blockers and decisions.',
      result:
        'We brought the team back on track, cut blocker time dramatically and launched on time.',
    },
  ],
  currentView: 'dashboard',
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  editingId: null,
  session: null,
};

export function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusColor(status: string): string {
  return STATUS_CONFIG[status]?.color || '#78716c';
}

export function getStatusBg(status: string): string {
  return STATUS_CONFIG[status]?.bg || '#f5f5f4';
}

export function persistData(): void {
  try {
    localStorage.setItem(
      'applytrack_ai_data',
      JSON.stringify({
        applications: state.applications,
        emailImports: state.emailImports,
        careerGoals: state.careerGoals,
        networkContacts: state.networkContacts,
        storyBank: state.storyBank,
      })
    );
    createAutoBackup();
  } catch (e) {
    console.warn('Failed to persist to localStorage:', e);
  }
}

export function createAutoBackup(): void {
  try {
    const backups = JSON.parse(localStorage.getItem('applytrack_backups') || '[]');
    backups.unshift({
      ts: Date.now(),
      data: {
        applications: state.applications,
        emailImports: state.emailImports,
        careerGoals: state.careerGoals,
      },
    });
    localStorage.setItem('applytrack_backups', JSON.stringify(backups.slice(0, 5)));
  } catch {}
}

export async function syncWithBackend(): Promise<void> {
  try {
    const data = await graphQLRequest<{
      applications: Application[];
      careerGoals?: CareerGoals;
      networkContacts?: NetworkContact[];
      stories?: StoryItem[];
      emailImports?: EmailImport[];
    }>(`
      query SyncAll {
        applications {
          id company title url location workMode employmentType salaryMin salaryMax
          applicationDate deadline source priority status notes recruiterName
          recruiterEmail resumeVersion tags interviewPrep
          timeline { date event type }
        }
        careerGoals {
          weeklyApplications weeklyInterviews targetRole targetDate notes streak lastWeekKey
        }
        networkContacts {
          id name role company email notes lastTouch
        }
        stories {
          id title tags situation task action result
        }
        emailImports {
          id company title source status detectedDate confidence emailSubject extractData
        }
      }
    `);

    if (data?.applications && data.applications.length > 0) {
      state.applications = data.applications;
    }
    if (data?.careerGoals) {
      state.careerGoals = { ...state.careerGoals, ...data.careerGoals };
    }
    if (data?.networkContacts && data.networkContacts.length > 0) {
      state.networkContacts = data.networkContacts;
    }
    if (data?.stories && data.stories.length > 0) {
      state.storyBank = data.stories;
    }
    if (data?.emailImports && data.emailImports.length > 0) {
      state.emailImports = data.emailImports.map((item: any) => ({
        ...item,
        extractData: typeof item.extractData === 'string' ? JSON.parse(item.extractData || '{}') : item.extractData,
      }));
    }
    persistData();
  } catch (err) {
    // If backend is not connected yet, gracefully use local state
    console.info('Backend GraphQL offline or booting. Operating seamlessly with local cache.');
  }
}

export function seedDefaultData(): void {
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

  state.applications = [
    {
      id: 1,
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

  state.emailImports = [
    {
      id: 101,
      company: 'Amazon',
      title: 'Frontend Engineer',
      source: 'email',
      status: 'pending',
      detectedDate: d(0),
      confidence: 'High',
      emailSubject: 'Application Confirmation - Amazon',
      extractData: {
        company: 'Amazon',
        title: 'Frontend Engineer',
        status: 'applied',
        recruiterName: 'Rachel Lee',
        recruiterEmail: 'rachel.lee@amazon.com',
      },
    },
    {
      id: 102,
      company: 'Slack',
      title: 'Software Developer',
      source: 'email',
      status: 'pending',
      detectedDate: d(1),
      confidence: 'Medium',
      emailSubject: 'Interview Invitation - Slack',
      extractData: {
        company: 'Slack',
        title: 'Software Developer',
        status: 'interview',
        recruiterName: 'Sam Patel',
        recruiterEmail: 'sam.patel@slack.com',
      },
    },
    {
      id: 103,
      company: 'Canva',
      title: 'Frontend Engineer',
      source: 'email',
      status: 'pending',
      detectedDate: d(2),
      confidence: 'High',
      emailSubject: 'Application Received - Canva',
      extractData: {
        company: 'Canva',
        title: 'Frontend Engineer',
        status: 'applied',
        recruiterName: '',
        recruiterEmail: '',
      },
    },
  ];

  persistData();
}

export function seedData(): void {
  const saved = localStorage.getItem('applytrack_ai_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.applications = Array.isArray(parsed.applications) ? parsed.applications : [];
      state.emailImports = Array.isArray(parsed.emailImports) ? parsed.emailImports : [];
      if (parsed.careerGoals) state.careerGoals = { ...state.careerGoals, ...parsed.careerGoals };
      if (Array.isArray(parsed.networkContacts) && parsed.networkContacts.length) {
        state.networkContacts = parsed.networkContacts;
      }
      if (Array.isArray(parsed.storyBank) && parsed.storyBank.length) {
        state.storyBank = parsed.storyBank;
      }
    } catch {
      state.applications = [];
      state.emailImports = [];
    }
    if (state.applications.length === 0) {
      seedDefaultData();
    }
  } else {
    seedDefaultData();
  }
}
