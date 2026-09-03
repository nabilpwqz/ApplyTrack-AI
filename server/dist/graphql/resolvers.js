import prisma from '../config/prisma';
import { aiService } from '../services/ai.service';
import { syncRecruiterEmails } from '../services/email.service';
const MOCK_COMPANIES = [
    {
        id: 'c1',
        name: 'Google',
        domain: 'google.com',
        website: 'https://google.com',
        industry: 'Big Tech',
        healthScore: 88,
        layoffRisk: 12,
        size: '10000+ employees',
        description: 'Search, Cloud, and AI innovation ecosystem.',
        factors: ['✓ Strong balance sheet', '✓ Active AI investment', '⚠ Tech industry consolidation'],
        lastAnalyzedAt: new Date().toISOString(),
    },
    {
        id: 'c2',
        name: 'Microsoft',
        domain: 'microsoft.com',
        website: 'https://microsoft.com',
        industry: 'Big Tech',
        healthScore: 90,
        layoffRisk: 10,
        size: '10000+ employees',
        description: 'Cloud computing, AI, and enterprise software.',
        factors: ['✓ Azure growth', '✓ Strategic OpenAI partnership'],
        lastAnalyzedAt: new Date().toISOString(),
    },
    {
        id: 'c3',
        name: 'OpenAI',
        domain: 'openai.com',
        website: 'https://openai.com',
        industry: 'Artificial Intelligence',
        healthScore: 94,
        layoffRisk: 6,
        size: '1001-5000 employees',
        description: 'Generative AI models and ChatGPT lab.',
        factors: ['✓ Industry market leader in generative models'],
        lastAnalyzedAt: new Date().toISOString(),
    },
    {
        id: 'c4',
        name: 'Stripe',
        domain: 'stripe.com',
        website: 'https://stripe.com',
        industry: 'Fintech',
        healthScore: 86,
        layoffRisk: 14,
        size: '5001-10000 employees',
        description: 'Financial technology payment platform.',
        factors: ['✓ Strong payment volumes across web enterprise'],
        lastAnalyzedAt: new Date().toISOString(),
    },
];
const MOCK_APPLICATIONS = [
    {
        id: 'app_1',
        userId: 'u1',
        jobTitle: 'Frontend Software Engineer',
        companyName: 'Google',
        company: MOCK_COMPANIES[0],
        status: 'INTERVIEW',
        priority: 'HIGH',
        applicationDate: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        lastActivityAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        location: 'Mountain View, CA',
        workMode: 'HYBRID',
        salary: { min: 140000, max: 185000, currency: 'USD' },
        source: 'LinkedIn',
        notes: 'Passed initial recruiter screening. Technical round focused on React architecture next week.',
        resumeVersion: 'React Focused Resume v2',
        coverLetter: 'Tailored Google Cover Letter',
        tags: ['React', 'Frontend', 'High Pay'],
        timeline: [
            { id: 't1', type: 'CREATION', title: 'Application Submitted', occurredAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString() },
            { id: 't2', type: 'SCREENING', title: 'Recruiter Screening Completed', occurredAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString() },
        ],
        contacts: [{ name: 'Sarah Jenkins', role: 'Senior Recruiter', email: 'sjenkins@google.com' }],
    },
    {
        id: 'app_2',
        userId: 'u1',
        jobTitle: 'Full Stack Engineer (API)',
        companyName: 'OpenAI',
        company: MOCK_COMPANIES[2],
        status: 'ASSESSMENT',
        priority: 'HIGH',
        applicationDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        lastActivityAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        location: 'San Francisco, CA',
        workMode: 'HYBRID',
        salary: { min: 180000, max: 240000, currency: 'USD' },
        source: 'Company Website',
        notes: 'Completed take-home code assessment task.',
        resumeVersion: 'AI Systems Resume',
        tags: ['Full Stack', 'OpenAI'],
        timeline: [
            { id: 't3', type: 'CREATION', title: 'Application Submitted', occurredAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
        ],
        contacts: [{ name: 'David Chen', role: 'Talent Scout', email: 'dchen@openai.com' }],
    },
    {
        id: 'app_3',
        userId: 'u1',
        jobTitle: 'Senior React Developer',
        companyName: 'Stripe',
        company: MOCK_COMPANIES[3],
        status: 'FINAL_INTERVIEW',
        priority: 'HIGH',
        applicationDate: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
        lastActivityAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        location: 'Remote',
        workMode: 'REMOTE',
        salary: { min: 155000, max: 195000, currency: 'USD' },
        source: 'Referral',
        notes: 'Final leadership interview scheduled.',
        resumeVersion: 'Senior Engineering Resume',
        tags: ['Fintech', 'Remote'],
        timeline: [
            { id: 't4', type: 'CREATION', title: 'Application Submitted', occurredAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
        ],
    },
];
export const resolvers = {
    Query: {
        me: async (_, __, context) => {
            const userId = context?.user?.id;
            if (userId) {
                try {
                    const user = await prisma.user.findUnique({ where: { id: userId } });
                    if (user)
                        return user;
                }
                catch { }
            }
            return {
                id: 'guest_demo_user',
                name: context?.user?.name || 'Guest',
                email: 'guest@applytrack.ai',
                headline: 'Frontend Software Engineer',
                location: 'Austin, TX',
                skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Prisma'],
            };
        },
        applications: async (_, args) => {
            try {
                const where = {};
                if (args.status && args.status !== 'ALL')
                    where.status = args.status;
                if (args.priority)
                    where.priority = args.priority;
                const apps = await prisma.application.findMany({
                    where,
                    include: { company: true, timelineEvents: true, interviews: true, reminders: true },
                });
                if (apps && apps.length > 0)
                    return apps;
            }
            catch { }
            let list = [...MOCK_APPLICATIONS];
            if (args.status && args.status !== 'ALL') {
                list = list.filter(a => a.status === args.status);
            }
            if (args.search) {
                const q = args.search.toLowerCase();
                list = list.filter(a => a.jobTitle.toLowerCase().includes(q) || a.companyName.toLowerCase().includes(q));
            }
            return list;
        },
        application: async (_, { id }) => {
            try {
                const app = await prisma.application.findUnique({
                    where: { id },
                    include: { company: true, timelineEvents: true, interviews: true, aiAnalyses: true },
                });
                if (app) {
                    return {
                        application: app,
                        aiAnalyses: app.aiAnalyses || [],
                    };
                }
            }
            catch { }
            const found = MOCK_APPLICATIONS.find(a => a.id === id) || MOCK_APPLICATIONS[0];
            return {
                application: found,
                aiAnalyses: [
                    {
                        type: 'INTERVIEW_PROBABILITY',
                        score: 84,
                        result: 'High Compatibility',
                        factors: ['✓ Skills match job requirements', '✓ Strong experience overlap'],
                        recommendations: ['Highlight React architecture experience', 'Review system design fundamentals'],
                    },
                ],
            };
        },
        companies: async () => {
            try {
                const comps = await prisma.company.findMany();
                if (comps && comps.length > 0)
                    return comps;
            }
            catch { }
            return MOCK_COMPANIES;
        },
        company: async (_, { id }) => {
            try {
                const comp = await prisma.company.findUnique({ where: { id } });
                if (comp)
                    return comp;
            }
            catch { }
            return MOCK_COMPANIES.find(c => c.id === id) || MOCK_COMPANIES[0];
        },
        interviews: async () => {
            try {
                const list = await prisma.interview.findMany({ include: { application: true } });
                if (list && list.length > 0)
                    return list;
            }
            catch { }
            return [
                {
                    id: 'i1',
                    applicationId: MOCK_APPLICATIONS[0].id,
                    application: MOCK_APPLICATIONS[0],
                    type: 'TECHNICAL',
                    scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
                    duration: 60,
                    interviewer: 'Alex Rivera',
                    location: 'Google Meet',
                },
                {
                    id: 'i2',
                    applicationId: MOCK_APPLICATIONS[2].id,
                    application: MOCK_APPLICATIONS[2],
                    type: 'FINAL',
                    scheduledAt: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
                    duration: 45,
                    interviewer: 'Elena Vance',
                    location: 'Zoom',
                },
            ];
        },
        reminders: async (_, { completed }) => {
            try {
                const where = {};
                if (completed !== undefined)
                    where.completed = completed;
                const list = await prisma.reminder.findMany({ where, include: { application: true } });
                if (list && list.length > 0)
                    return list;
            }
            catch { }
            return [
                {
                    id: 'r1',
                    applicationId: MOCK_APPLICATIONS[0].id,
                    application: MOCK_APPLICATIONS[0],
                    title: 'Follow up on Google Technical Loop',
                    description: 'Send thank you note to recruiter Alex.',
                    dueAt: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
                    completed: false,
                    type: 'FOLLOW_UP',
                },
                {
                    id: 'r2',
                    applicationId: MOCK_APPLICATIONS[1].id,
                    application: MOCK_APPLICATIONS[1],
                    title: 'Complete OpenAI Code Assessment',
                    description: 'Submit full-stack challenge before deadline.',
                    dueAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
                    completed: false,
                    type: 'INTERVIEW_PREP',
                },
            ];
        },
        analyticsSummary: async () => {
            return {
                metrics: {
                    total: 42,
                    active: 17,
                    interviews: 8,
                    offers: 2,
                    responseRate: 40,
                    interviewRate: 19,
                    offerRate: 5,
                    avgResponseDays: 5,
                },
                weeklyTrend: [
                    { day: 'Mon', count: 5 },
                    { day: 'Tue', count: 8 },
                    { day: 'Wed', count: 12 },
                    { day: 'Thu', count: 9 },
                    { day: 'Fri', count: 4 },
                    { day: 'Sat', count: 1 },
                    { day: 'Sun', count: 3 },
                ],
                sourceAnalysis: [
                    { source: 'Referral', applications: 4, responseRate: 75, interviewRate: 50 },
                    { source: 'Company Website', applications: 12, responseRate: 42, interviewRate: 25 },
                    { source: 'LinkedIn', applications: 18, responseRate: 33, interviewRate: 16 },
                    { source: 'Indeed', applications: 8, responseRate: 25, interviewRate: 12 },
                ],
                companyAnalysis: [
                    { sizeGroup: 'Enterprise (1000+ employees)', applications: 20, responseRate: 30 },
                    { sizeGroup: 'Mid-size (51-1000 employees)', applications: 14, responseRate: 43 },
                    { sizeGroup: 'Startup (1-50 employees)', applications: 8, responseRate: 62 },
                ],
            };
        },
        emailEvents: async () => {
            try {
                const events = await prisma.emailEvent.findMany({ orderBy: { receivedAt: 'desc' } });
                if (events && events.length > 0)
                    return events;
            }
            catch { }
            return [
                {
                    id: 'sim_email_1',
                    sender: 'careers@google.com',
                    subject: 'Google Technical Loop Invitation',
                    bodyPreview: 'Dear Candidate, We would like to invite you to our virtual panel technical round next Tuesday...',
                    receivedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
                    company: 'Google',
                    extractedTitle: 'Frontend Software Engineer',
                    extractedStatus: 'INTERVIEW',
                    recruiterEmail: 'sjenkins@google.com',
                    confidence: 0.96,
                    processed: false,
                },
            ];
        },
        jobMatch: async (_, args) => {
            const prob = await aiService.calculateInterviewProbability({
                candidateProfile: { skills: ['React', 'TypeScript', 'GraphQL'] },
                jobTitle: args.jobTitle,
                companyName: args.companyName || 'Target Company',
                jobDescription: args.description,
            });
            return {
                matchScore: prob.score,
                result: prob.result,
                factors: prob.factors,
                recommendations: prob.recommendations,
                missingSkills: ['Docker', 'AWS', 'Kubernetes'],
            };
        },
        interviewPrep: async (_, args) => {
            const found = MOCK_APPLICATIONS.find(a => a.id === args.applicationId) || MOCK_APPLICATIONS[0];
            const prob = await aiService.calculateInterviewProbability({
                candidateProfile: { skills: ['React', 'TypeScript', 'Node.js'] },
                jobTitle: found.jobTitle,
                companyName: found.companyName,
            });
            return {
                score: prob.score,
                result: prob.result,
                factors: prob.factors,
                recommendations: prob.recommendations,
                studyTopics: prob.studyTopics,
                likelyQuestions: prob.likelyQuestions,
            };
        },
    },
    Mutation: {
        register: async (_, { name, email }) => {
            const formattedName = name || (email ? email.split('@')[0] : 'User');
            return {
                success: true,
                message: 'Account registered successfully',
                user: {
                    id: 'u_' + Date.now(),
                    name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
                    email,
                    headline: 'Software Engineer',
                    location: 'Austin, TX',
                    skills: ['React', 'TypeScript', 'GraphQL', 'Prisma'],
                    token: 'jwt_mock_token_' + Date.now(),
                },
                token: 'jwt_mock_token_' + Date.now(),
            };
        },
        login: async (_, { email }) => {
            const name = email ? email.split('@')[0] : 'User';
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            return {
                success: true,
                message: 'Sign in successful',
                user: {
                    id: 'u_' + Date.now(),
                    name: formattedName,
                    email,
                    headline: 'Software Engineer',
                    location: 'Austin, TX',
                    skills: ['React', 'TypeScript', 'GraphQL', 'Prisma'],
                    token: 'jwt_mock_token_' + Date.now(),
                },
                token: 'jwt_mock_token_' + Date.now(),
            };
        },
        loginDemo: async () => {
            return {
                success: true,
                message: 'Demo session initialized',
                user: {
                    id: 'guest_demo_user',
                    name: 'Guest',
                    email: 'guest@applytrack.ai',
                    headline: 'Frontend Software Engineer',
                    location: 'Austin, TX',
                    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Prisma'],
                    token: 'mock_demo_jwt_token_2026',
                },
                token: 'mock_demo_jwt_token_2026',
            };
        },
        createApplication: async (_, { input }) => {
            const comp = MOCK_COMPANIES.find(c => c.name.toLowerCase() === input.companyName.toLowerCase()) || MOCK_COMPANIES[0];
            const newApp = {
                id: 'app_' + Date.now(),
                userId: 'u1',
                jobTitle: input.jobTitle,
                companyName: input.companyName,
                company: comp,
                status: input.status || 'APPLIED',
                priority: input.priority || 'MEDIUM',
                applicationDate: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
                location: input.location || 'Remote',
                workMode: input.workMode || 'REMOTE',
                salary: { min: input.minSalary, max: input.maxSalary, currency: 'USD' },
                source: input.source || 'Website',
                notes: input.notes || '',
                resumeVersion: 'Main Resume',
                tags: ['React', 'TypeScript'],
                timeline: [{ id: 't_' + Date.now(), type: 'CREATION', title: 'Application Created', occurredAt: new Date().toISOString() }],
            };
            MOCK_APPLICATIONS.unshift(newApp);
            return newApp;
        },
        updateApplication: async (_, { id, input }) => {
            const found = MOCK_APPLICATIONS.find(a => a.id === id);
            if (found) {
                Object.assign(found, input, { lastActivityAt: new Date().toISOString() });
                return found;
            }
            return MOCK_APPLICATIONS[0];
        },
        deleteApplication: async (_, { id }) => {
            const idx = MOCK_APPLICATIONS.findIndex(a => a.id === id);
            if (idx !== -1)
                MOCK_APPLICATIONS.splice(idx, 1);
            return { success: true, message: 'Application deleted' };
        },
        addTimelineEvent: async (_, args) => {
            return {
                id: 't_' + Date.now(),
                type: args.type,
                title: args.title,
                description: args.description,
                occurredAt: new Date().toISOString(),
            };
        },
        createInterview: async (_, { input }) => {
            return {
                id: 'i_' + Date.now(),
                applicationId: input.applicationId,
                type: input.type || 'TECHNICAL',
                scheduledAt: input.scheduledAt,
                duration: input.duration || 45,
                interviewer: input.interviewer || 'Hiring Lead',
                location: input.location || 'Google Meet',
            };
        },
        createReminder: async (_, { input }) => {
            return {
                id: 'r_' + Date.now(),
                applicationId: input.applicationId,
                title: input.title,
                description: input.description,
                dueAt: input.dueAt,
                completed: false,
                type: input.type || 'FOLLOW_UP',
            };
        },
        toggleReminder: async (_, { id }) => {
            return {
                id,
                applicationId: 'app_1',
                title: 'Task updated',
                dueAt: new Date().toISOString(),
                completed: true,
                type: 'FOLLOW_UP',
            };
        },
        deleteReminder: async () => {
            return { success: true, message: 'Reminder deleted' };
        },
        generateFollowUp: async (_, args) => {
            const found = MOCK_APPLICATIONS.find(a => a.id === args.applicationId) || MOCK_APPLICATIONS[0];
            return aiService.generateFollowUpEmail({
                candidateName: 'Guest',
                companyName: found.companyName,
                jobTitle: found.jobTitle,
                daysSinceLastContact: 5,
                tone: args.tone,
                customInfo: args.customInfo,
            });
        },
        analyzeSalary: async (_, args) => {
            return aiService.analyzeSalary(args);
        },
        analyzeCompany: async (_, { id }) => {
            const comp = MOCK_COMPANIES.find(c => c.id === id) || MOCK_COMPANIES[0];
            const health = await aiService.analyzeCompanyHealth(comp.name, comp.domain, comp.industry);
            return {
                ...comp,
                healthScore: health.healthScore,
                layoffRisk: health.layoffRisk,
                description: health.description,
                factors: health.factors,
                lastAnalyzedAt: new Date().toISOString(),
            };
        },
        syncEmails: async () => {
            return syncRecruiterEmails('u1');
        },
        processEmailEvent: async () => {
            return { success: true, message: 'Recruiter email event processed' };
        },
    },
};
