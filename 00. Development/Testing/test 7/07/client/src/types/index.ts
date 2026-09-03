export type ApplicationStatus = 
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'GHOSTED';

export type ApplicationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE';

export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

export interface RecruiterContact {
  _id?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface TimelineEvent {
  _id?: string;
  type: string;
  title: string;
  description?: string;
  occurredAt: string | Date;
}

export interface Company {
  _id: string;
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  size?: string;
  healthScore?: number;
  layoffRisk?: number;
  description?: string;
  factors?: string[];
  lastAnalyzedAt?: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationSalary {
  min?: number;
  max?: number;
  currency?: string;
}

export interface Application {
  _id: string;
  userId: string;
  jobTitle: string;
  companyId?: Company | any;
  companyName?: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  applicationDate: string;
  lastActivityAt: string;
  deadline?: string;
  location?: string;
  workMode?: WorkMode;
  salary?: ApplicationSalary;
  jobUrl?: string;
  source?: string;
  notes?: string;
  timeline?: TimelineEvent[];
  contacts?: RecruiterContact[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Interview {
  _id: string;
  applicationId: Application;
  userId: string;
  type: 'HR_SCREEN' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'MANAGEMENT' | 'FINAL';
  scheduledAt: string;
  duration: number;
  interviewer?: string;
  meetingUrl?: string;
  location?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reminder {
  _id: string;
  applicationId: Application;
  userId: string;
  title: string;
  description?: string;
  dueAt: string;
  completed: boolean;
  type: 'FOLLOW_UP' | 'INTERVIEW_PREP' | 'THANK_YOU_EMAIL' | 'OFFER_DEADLINE';
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailEvent {
  _id: string;
  userId: string;
  provider: 'GMAIL' | 'SIMULATION' | 'IMAP';
  externalId?: string;
  sender: string;
  subject: string;
  bodyPreview: string;
  receivedAt: string;
  extractedData: {
    company?: string;
    jobTitle?: string;
    applicationStatus?: ApplicationStatus;
    interviewDate?: string;
    recruiterEmail?: string;
    summary?: string;
  };
  confidence: number;
  processed: boolean;
  applicationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  headline?: string;
  location?: string;
  experienceLevel?: ExperienceLevel;
  skills?: string[];
  preferredRoles?: string[];
  preferredSalary?: ApplicationSalary;
}

export interface UserPreferences {
  emailNotifications?: boolean;
  inactivityAlerts?: boolean;
  autoEmailSync?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export interface AnalyticsSummary {
  metrics: {
    total: number;
    active: number;
    interviews: number;
    offers: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    avgResponseDays: number;
  };
  funnel: Record<ApplicationStatus, number>;
  weeklyTrend: Array<{ day: string; count: number }>;
  sourceAnalysis: Array<{
    source: string;
    applications: number;
    responseRate: number;
    interviewRate: number;
  }>;
  companyAnalysis: Array<{
    sizeGroup: string;
    applications: number;
    responseRate: number;
  }>;
}

export interface JobMatchResult {
  matchScore: number;
  result: string;
  factors: string[];
  recommendations: string[];
  missingSkills?: string[];
}

export interface SalaryAnalysisResult {
  marketMin: number;
  marketMax: number;
  marketMedian: number;
  offerEvaluation: string;
  targetSalary: number;
  acceptableSalary: number;
  leverageLevel: string;
  leverageFactors: string[];
  negotiationEmail: string;
}

export interface InterviewPrepResult {
  score: number;
  result: string;
  factors: string[];
  recommendations: string[];
  studyTopics: string[];
  likelyQuestions: string[];
}

export interface FollowUpEmailResult {
  subject: string;
  body: string;
}
