export interface UserProfile {
  headline?: string;
  location?: string;
  experienceLevel?: string;
  skills?: string[];
  preferredRoles?: string[];
  preferredSalary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
  profile?: UserProfile;
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
}

export interface TimelineEvent {
  type: string;
  title: string;
  description?: string;
  occurredAt: Date | string;
}

export interface RecruiterContact {
  name: string;
  role?: string;
  email?: string;
}

export interface Application {
  _id: string;
  jobTitle: string;
  companyId?: Company;
  companyName?: string;
  status: 'SAVED' | 'APPLIED' | 'SCREENING' | 'ASSESSMENT' | 'INTERVIEW' | 'FINAL_INTERVIEW' | 'OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'GHOSTED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  applicationDate: Date | string;
  lastActivityAt: Date | string;
  deadline?: Date | string;
  location?: string;
  workMode?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  jobUrl?: string;
  source?: string;
  notes?: string;
  timeline?: TimelineEvent[];
  contacts?: RecruiterContact[];
}

export interface Interview {
  _id: string;
  applicationId?: Application;
  type: 'HR_SCREEN' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'MANAGEMENT' | 'FINAL';
  scheduledAt: Date | string;
  duration?: number;
  interviewer?: string;
  meetingUrl?: string;
  location?: string;
}

export interface Reminder {
  _id: string;
  applicationId?: Application;
  title: string;
  description?: string;
  dueAt: Date | string;
  completed: boolean;
}

export interface EmailEvent {
  _id: string;
  provider: string;
  sender: string;
  subject: string;
  bodyPreview: string;
  receivedAt: Date | string;
  extractedData: {
    company: string;
    jobTitle: string;
    applicationStatus: string;
    recruiterEmail?: string;
  };
  confidence: number;
  processed: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
}
