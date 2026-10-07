/**
 * Status lifecycle transitions for an application in the pipeline.
 * Tracks progression from discovery to offer acceptance or archival.
 */
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

/**
 * Priority level indicating urgency and focus tier for follow-ups.
 */
export type Priority = 'High' | 'Medium' | 'Low';

/**
 * Historical milestone entry representing an interview or status change event.
 */
export interface TimelineItem {
  date: string;
  event: string;
  type: string;
}

/**
 * Primary job application entity with interview tracking and recruiter metadata.
 */
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

/**
 * Extracted job application candidate detected via automated inbox sync.
 */
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
