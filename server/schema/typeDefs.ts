export const typeDefs = `#graphql
  enum Role {
    USER
    ADMIN
  }

  enum Provider {
    email
    google
    guest
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    provider: String!
    plan: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type TimelineEvent {
    id: ID!
    applicationId: Int!
    date: String!
    event: String!
    type: String!
    createdAt: String!
  }

  type Application {
    id: Int!
    userId: String
    company: String!
    title: String!
    url: String
    location: String
    workMode: String
    employmentType: String
    salaryMin: Int
    salaryMax: Int
    applicationDate: String
    deadline: String
    source: String
    priority: String!
    status: String!
    notes: String
    recruiterName: String
    recruiterEmail: String
    resumeVersion: String
    tags: [String!]!
    interviewPrep: String
    timeline: [TimelineEvent!]!
    createdAt: String!
    updatedAt: String!
  }

  type EmailImport {
    id: Int!
    userId: String
    company: String!
    title: String!
    source: String!
    status: String!
    detectedDate: String!
    confidence: String!
    emailSubject: String!
    extractData: String!
    createdAt: String!
    updatedAt: String!
  }

  type CareerGoal {
    id: ID!
    userId: String
    weeklyApplications: Int!
    weeklyInterviews: Int!
    targetRole: String
    targetDate: String
    notes: String
    streak: Int!
    lastWeekKey: String
    createdAt: String!
    updatedAt: String!
  }

  type NetworkContact {
    id: Int!
    userId: String
    name: String!
    role: String!
    company: String!
    email: String
    notes: String
    lastTouch: String!
    createdAt: String!
    updatedAt: String!
  }

  type Story {
    id: Int!
    userId: String
    title: String!
    tags: [String!]!
    situation: String
    task: String
    action: String
    result: String
    createdAt: String!
    updatedAt: String!
  }

  type BriefNote {
    id: ID!
    userId: String
    text: String!
    date: String!
    createdAt: String!
  }

  type Subscription {
    id: ID!
    userId: String
    plan: String!
    status: String!
    requestedPlan: String
    method: String!
    amount: String
    currency: String
    requestedAt: String
    approvedAt: String
    updatedAt: String!
  }

  type BillingTransaction {
    id: ID!
    userId: String
    txnId: String!
    time: String!
    method: String!
    gateway: String!
    amount: String!
    currency: String!
    status: String!
    message: String!
    createdAt: String!
  }

  type AdminUser {
    id: ID!
    name: String!
    email: String!
    plan: String!
    applicationsCount: Int!
    status: String!
  }

  type PremiumPayer {
    name: String!
    email: String!
    method: String!
    plan: String!
    paid: String!
  }

  type PremiumApproval {
    id: ID!
    userName: String!
    userEmail: String!
    method: String!
    requestedPlan: String!
    status: String!
    requestedAt: String
  }

  type AnalyticsSummary {
    totalApplications: Int!
    activeOpportunities: Int!
    interviewsCount: Int!
    offersCount: Int!
    rejectionsCount: Int!
    responseRate: Float!
    statusDistribution: [StatusCount!]!
    priorityDistribution: [PriorityCount!]!
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  type PriorityCount {
    priority: String!
    count: Int!
  }

  type JobMatchResult {
    score: Int!
    matchedSkills: [String!]!
    missingSkills: [String!]!
    recommendation: String!
    strengths: [String!]!
  }

  type InterviewScoreResult {
    overallScore: Int!
    readinessRating: String!
    breakdown: [ScoreMetric!]!
    tips: [String!]!
  }

  type ScoreMetric {
    name: String!
    score: Int!
  }

  type CompanyHealthResult {
    score: Int!
    riskRating: String!
    indicators: [HealthIndicator!]!
    summary: String!
  }

  type HealthIndicator {
    factor: String!
    status: String!
    detail: String!
  }

  type SalaryAnalysisResult {
    medianMarket: Int!
    percentile25: Int!
    percentile75: Int!
    differencePercent: Float!
    leverageScore: Int!
    recommendation: String!
    talkingPoints: [String!]!
  }

  type GeneratedEmailResult {
    subject: String!
    body: String!
  }

  # Inputs
  input ApplicationInput {
    company: String!
    title: String!
    url: String
    location: String
    workMode: String
    employmentType: String
    salaryMin: Int
    salaryMax: Int
    applicationDate: String
    deadline: String
    source: String
    priority: String
    status: String
    notes: String
    recruiterName: String
    recruiterEmail: String
    resumeVersion: String
    tags: [String!]
  }

  input CareerGoalInput {
    weeklyApplications: Int
    weeklyInterviews: Int
    targetRole: String
    targetDate: String
    notes: String
  }

  input NetworkContactInput {
    name: String!
    role: String!
    company: String!
    email: String
    notes: String
  }

  input StoryInput {
    title: String!
    tags: [String!]
    situation: String
    task: String
    action: String
    result: String
  }

  input SubscriptionInput {
    plan: String!
    method: String!
    email: String
    currency: String
    amount: String
  }

  input JobMatchInput {
    jobTitle: String!
    company: String!
    skills: String!
    experience: Int!
    jobDescription: String!
    locationPreference: String
  }

  input InterviewScoreInput {
    jobTitle: String!
    company: String!
    skillMatch: Int!
    expMatch: Int!
    resumeRelevance: Int!
    prepLevel: Int!
    competitiveness: String!
  }

  input CompanyHealthInput {
    company: String!
    size: String!
    industry: String!
    layoffs: String!
    hiring: String!
    funding: String!
  }

  input SalaryAnalysisInput {
    jobTitle: String!
    company: String!
    offeredSalary: Int!
    experienceYears: Int!
    location: String!
    otherComp: String
  }

  input FollowUpEmailInput {
    company: String!
    jobTitle: String!
    appDate: String
    lastContact: String
    status: String!
    recruiterName: String
    tone: String!
    context: String
  }

  type Query {
    me: User
    applications(search: String, status: String, priority: String): [Application!]!
    application(id: Int!): Application
    emailImports(status: String): [EmailImport!]!
    careerGoals: CareerGoal
    networkContacts(search: String, role: String): [NetworkContact!]!
    stories: [Story!]!
    briefNotes: [BriefNote!]!
    subscription: Subscription
    billingTransactions: [BillingTransaction!]!
    analyticsSummary: AnalyticsSummary!
    
    # Admin Queries
    adminUsers(search: String): [AdminUser!]!
    premiumPayers: [PremiumPayer!]!
    premiumApprovals: [PremiumApproval!]!

    # AI Simulations
    analyzeJobMatch(input: JobMatchInput!): JobMatchResult!
    calculateInterviewScore(input: InterviewScoreInput!): InterviewScoreResult!
    analyzeCompanyHealth(input: CompanyHealthInput!): CompanyHealthResult!
    analyzeSalary(input: SalaryAnalysisInput!): SalaryAnalysisResult!
    generateFollowUpEmail(input: FollowUpEmailInput!): GeneratedEmailResult!
  }

  type Mutation {
    # Authentication
    login(email: String!, password: String!): AuthPayload!
    signup(name: String!, email: String!, password: String!): AuthPayload!
    googleAuth(name: String, email: String): AuthPayload!
    guestAuth: AuthPayload!

    # Application Operations
    createApplication(input: ApplicationInput!): Application!
    updateApplication(id: Int!, input: ApplicationInput!): Application!
    deleteApplication(id: Int!): Boolean!
    updateApplicationStatus(id: Int!, status: String!): Application!
    toggleInterviewPrepItem(applicationId: Int!, item: String!, checked: Boolean!): Application!

    # Email Imports
    processEmailImport(id: Int!, action: String!): Boolean!

    # Career Goals
    saveCareerGoals(input: CareerGoalInput!): CareerGoal!

    # Contacts & Stories
    createContact(input: NetworkContactInput!): NetworkContact!
    updateContact(id: Int!, input: NetworkContactInput!): NetworkContact!
    deleteContact(id: Int!): Boolean!
    createStory(input: StoryInput!): Story!
    deleteStory(id: Int!): Boolean!

    # Daily Brief
    createBriefNote(text: String!): BriefNote!

    # Subscription & Billing
    saveSubscription(input: SubscriptionInput!): Subscription!
    approvePremium(subscriptionId: ID!): Subscription!

    # Admin Operations
    toggleUserStatus(userId: ID!): AdminUser!
    deleteAdminUser(userId: ID!): Boolean!

    # System reset
    resetAllData: Boolean!
  }
`;
