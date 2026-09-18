export const typeDefs = `#graphql
  enum ApplicationStatus {
    SAVED
    APPLIED
    SCREENING
    ASSESSMENT
    INTERVIEW
    FINAL_INTERVIEW
    OFFER
    ACCEPTED
    REJECTED
    WITHDRAWN
    GHOSTED
  }

  enum Priority {
    HIGH
    MEDIUM
    LOW
  }

  enum WorkMode {
    REMOTE
    HYBRID
    ON_SITE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    headline: String
    location: String
    skills: [String!]
    token: String
  }

  type Company {
    id: ID!
    name: String!
    domain: String
    website: String
    industry: String
    size: String
    healthScore: Int
    layoffRisk: Int
    description: String
    factors: [String!]
    lastAnalyzedAt: String
  }

  type Salary {
    min: Int
    max: Int
    currency: String
  }

  type TimelineEvent {
    id: ID!
    type: String!
    title: String!
    description: String
    occurredAt: String!
  }

  type RecruiterContact {
    name: String!
    role: String
    email: String
  }

  type Application {
    id: ID!
    userId: String!
    jobTitle: String!
    companyName: String
    company: Company
    status: ApplicationStatus!
    priority: Priority!
    applicationDate: String!
    lastActivityAt: String!
    deadline: String
    location: String
    workMode: WorkMode
    salary: Salary
    source: String
    notes: String
    resumeVersion: String
    coverLetter: String
    tags: [String!]
    contacts: [RecruiterContact!]
    timeline: [TimelineEvent!]
  }

  type Interview {
    id: ID!
    applicationId: ID!
    application: Application
    type: String!
    scheduledAt: String!
    duration: Int!
    interviewer: String
    meetingUrl: String
    location: String
    notes: String
  }

  type Reminder {
    id: ID!
    applicationId: ID!
    application: Application
    title: String!
    description: String
    dueAt: String!
    completed: Boolean!
    type: String!
  }

  type EmailEvent {
    id: ID!
    sender: String!
    subject: String!
    bodyPreview: String!
    receivedAt: String!
    company: String
    extractedTitle: String
    extractedStatus: String
    recruiterEmail: String
    confidence: Float!
    processed: Boolean!
  }

  type Metrics {
    total: Int!
    active: Int!
    interviews: Int!
    offers: Int!
    responseRate: Int!
    interviewRate: Int!
    offerRate: Int!
    avgResponseDays: Int!
  }

  type SourceAnalysis {
    source: String!
    applications: Int!
    responseRate: Int!
    interviewRate: Int!
  }

  type CompanyAnalysis {
    sizeGroup: String!
    applications: Int!
    responseRate: Int!
  }

  type AnalyticsSummary {
    metrics: Metrics!
    weeklyTrend: [WeeklyTrend!]!
    sourceAnalysis: [SourceAnalysis!]!
    companyAnalysis: [CompanyAnalysis!]!
  }

  type WeeklyTrend {
    day: String!
    count: Int!
  }

  type JobMatchResult {
    matchScore: Int!
    result: String!
    factors: [String!]!
    recommendations: [String!]!
    missingSkills: [String!]
  }

  type SalaryAnalysisResult {
    marketMin: Int!
    marketMax: Int!
    marketMedian: Int!
    offerEvaluation: String!
    targetSalary: Int!
    acceptableSalary: Int!
    leverageLevel: String!
    leverageFactors: [String!]!
    negotiationEmail: String!
  }

  type InterviewPrepResult {
    score: Int!
    result: String!
    factors: [String!]!
    recommendations: [String!]!
    studyTopics: [String!]!
    likelyQuestions: [String!]!
  }

  type FollowUpEmailResult {
    subject: String!
    body: String!
  }

  type ApplicationDetailsPayload {
    application: Application!
    aiAnalyses: [AIAnalysisPayload!]!
  }

  type AIAnalysisPayload {
    type: String!
    score: Int
    result: String
    factors: [String!]
    recommendations: [String!]
  }

  type AuthPayload {
    success: Boolean!
    message: String
    user: User
    token: String
  }

  type ActionPayload {
    success: Boolean!
    message: String
  }

  input ApplicationInput {
    jobTitle: String!
    companyName: String!
    status: ApplicationStatus
    priority: Priority
    location: String
    workMode: WorkMode
    minSalary: Int
    maxSalary: Int
    source: String
    notes: String
  }

  input ApplicationUpdateInput {
    status: ApplicationStatus
    priority: Priority
    notes: String
    recruiterName: String
    recruiterEmail: String
  }

  input InterviewInput {
    applicationId: ID!
    type: String
    scheduledAt: String!
    duration: Int
    interviewer: String
    location: String
  }

  input ReminderInput {
    applicationId: ID!
    title: String!
    description: String
    dueAt: String!
    type: String
  }

  type Query {
    me: User
    applications(status: String, search: String, priority: String, sortBy: String): [Application!]!
    application(id: ID!): ApplicationDetailsPayload
    companies: [Company!]!
    company(id: ID!): Company
    interviews: [Interview!]!
    reminders(completed: Boolean): [Reminder!]!
    analyticsSummary: AnalyticsSummary!
    emailEvents: [EmailEvent!]!
    jobMatch(jobTitle: String!, companyName: String, description: String!): JobMatchResult!
    interviewPrep(applicationId: ID): InterviewPrepResult!
  }

  type Mutation {
    register(name: String!, email: String!, password: String): AuthPayload!
    login(email: String!, password: String): AuthPayload!
    loginDemo: AuthPayload!
    createApplication(input: ApplicationInput!): Application!
    updateApplication(id: ID!, input: ApplicationUpdateInput!): Application!
    deleteApplication(id: ID!): ActionPayload!
    addTimelineEvent(applicationId: ID!, type: String!, title: String!, description: String): TimelineEvent!
    createInterview(input: InterviewInput!): Interview!
    createReminder(input: ReminderInput!): Reminder!
    toggleReminder(id: ID!): Reminder!
    deleteReminder(id: ID!): ActionPayload!
    generateFollowUp(applicationId: ID!, tone: String, customInfo: String): FollowUpEmailResult!
    analyzeSalary(offerAmount: Int!, role: String!, location: String, experienceLevel: String): SalaryAnalysisResult!
    analyzeCompany(id: ID!): Company!
    syncEmails: [EmailEvent!]!
    processEmailEvent(id: ID!, action: String!, applicationId: ID): ActionPayload!
  }
`;
