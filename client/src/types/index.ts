export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'assessment'
  | 'interview'
  | 'final_interview'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type Priority = 'High' | 'Medium' | 'Low';

export interface TimelineItem {
  date: string;
  event: string;
  type: string;
}

export interface Application {
  id: number;
  userId?: string | null;
  company: string;
  title: string;
  url?: string;
  location?: string;
  workMode?: 'Remote' | 'Hybrid' | 'On-site' | string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  applicationDate: string;
  deadline?: string;
  source?: string;
  priority: Priority;
  status: ApplicationStatus;
  notes?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  resumeVersion?: string;
  tags: string[];
  timeline: TimelineItem[];
  interviewPrep?: Record<string, boolean> | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailImport {
  id: number;
  company: string;
  title: string;
  source: string;
  status: 'pending' | 'imported' | 'dismissed' | 'accepted';
  detectedDate: string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  emailSubject: string;
  extractData: {
    company?: string;
    title?: string;
    status?: string;
    recruiterName?: string;
    recruiterEmail?: string;
    location?: string;
  };
}

export interface CareerGoals {
  weeklyApplications: number;
  weeklyInterviews: number;
  targetRole?: string;
  targetDate?: string;
  notes?: string;
  streak?: number;
  lastWeekKey?: string;
}

export interface NetworkContact {
  id: number;
  name: string;
  role: 'Recruiter' | 'Hiring manager' | 'Referral' | 'Peer' | string;
  company: string;
  email?: string;
  notes?: string;
  lastTouch: string;
}

export interface StoryItem {
  id: number;
  title: string;
  tags: string[];
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
}

export interface UserSession {
  name: string;
  email: string;
  provider: 'email' | 'google' | 'guest';
  role?: 'USER' | 'ADMIN';
  token?: string;
}

export interface BillingTransaction {
  id: string;
  time: string;
  method: string;
  gateway: string;
  amount: string;
  currency: string;
  status: string;
  message: string;
}

export interface SubscriptionState {
  plan: 'free' | 'premium';
  status: 'free' | 'pending' | 'approved';
  requestedPlan?: 'premium';
  method: string;
  updatedAt?: string;
}
