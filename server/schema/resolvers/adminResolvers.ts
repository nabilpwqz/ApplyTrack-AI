import { GraphQLContext } from '../../context';
import {
  aiSimulationService,
  CompanyHealthParams,
  FollowUpEmailParams,
  InterviewScoreParams,
  JobMatchParams,
  SalaryAnalysisParams,
} from '../../services/aiSimulationService';

export const adminResolvers = {
  Query: {
    adminUsers: async (
      _: unknown,
      { search }: { search?: string },
      ctx: GraphQLContext
    ) => {
      const where: Record<string, unknown> = {};
      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ];
      }

      const users = await ctx.prisma.user.findMany({
        where,
        include: { applications: { select: { id: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        plan: u.plan === 'premium' ? 'Premium' : 'Free',
        applicationsCount: u.applications.length,
        status: u.status,
      }));
    },

    premiumPayers: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const premiumUsers = await ctx.prisma.user.findMany({
        where: { plan: 'premium' },
        include: {
          subscriptions: {
            where: { status: 'approved' },
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      });

      const fallbackPayers = [
        { name: 'Ava Morgan', email: 'ava.morgan@example.com', method: 'Card', plan: 'Premium', paid: '2026-08-14' },
        { name: 'Liam Patel', email: 'liam.patel@example.com', method: 'PayPal', plan: 'Premium', paid: '2026-08-21' },
        { name: 'Mia Chen', email: 'mia.chen@example.com', method: 'SSLCommerz', plan: 'Premium', paid: '2026-08-29' },
      ];

      if (!premiumUsers.length) return fallbackPayers;

      return premiumUsers.map((u) => {
        const sub = u.subscriptions[0];
        return {
          name: u.name,
          email: u.email,
          method: sub?.method || 'Card',
          plan: 'Premium',
          paid: sub?.updatedAt ? sub.updatedAt.toISOString().slice(0, 10) : '2026-08-20',
        };
      });
    },

    premiumApprovals: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const pendingSubs = await ctx.prisma.subscription.findMany({
        where: { status: 'pending' },
        include: { user: true },
        orderBy: { requestedAt: 'desc' },
      });

      return pendingSubs.map((sub) => ({
        id: sub.id,
        userName: sub.user?.name || 'Applicant',
        userEmail: sub.user?.email || 'user@example.com',
        method: sub.method,
        requestedPlan: sub.requestedPlan || 'premium',
        status: sub.status,
        requestedAt: sub.requestedAt?.toISOString() || null,
      }));
    },

    analyzeJobMatch: async (
      _: unknown,
      { input }: { input: JobMatchParams }
    ) => {
      return aiSimulationService.analyzeJobMatch(input);
    },

    calculateInterviewScore: async (
      _: unknown,
      { input }: { input: InterviewScoreParams }
    ) => {
      return aiSimulationService.calculateInterviewScore(input);
    },

    analyzeCompanyHealth: async (
      _: unknown,
      { input }: { input: CompanyHealthParams }
    ) => {
      return aiSimulationService.analyzeCompanyHealth(input);
    },

    analyzeSalary: async (
      _: unknown,
      { input }: { input: SalaryAnalysisParams }
    ) => {
      return aiSimulationService.analyzeSalary(input);
    },

    generateFollowUpEmail: async (
      _: unknown,
      { input }: { input: FollowUpEmailParams }
    ) => {
      return aiSimulationService.generateFollowUpEmail(input);
    },
  },

  Mutation: {
    toggleUserStatus: async (
      _: unknown,
      { userId }: { userId: string },
      ctx: GraphQLContext
    ) => {
      const user = await ctx.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const nextStatus = user.status === 'active' ? 'suspended' : 'active';
      const updated = await ctx.prisma.user.update({
        where: { id: userId },
        data: { status: nextStatus },
        include: { applications: { select: { id: true } } },
      });

      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        plan: updated.plan === 'premium' ? 'Premium' : 'Free',
        applicationsCount: updated.applications.length,
        status: updated.status,
      };
    },

    deleteAdminUser: async (
      _: unknown,
      { userId }: { userId: string },
      ctx: GraphQLContext
    ) => {
      await ctx.prisma.user.delete({ where: { id: userId } });
      return true;
    },

    resetAllData: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      // Clear data and re-seed defaults
      await ctx.prisma.timelineEvent.deleteMany({});
      await ctx.prisma.application.deleteMany({});
      await ctx.prisma.emailImport.deleteMany({});
      await ctx.prisma.networkContact.deleteMany({});
      await ctx.prisma.story.deleteMany({});
      await ctx.prisma.briefNote.deleteMany({});
      await ctx.prisma.billingTransaction.deleteMany({});
      await ctx.prisma.subscription.deleteMany({});
      return true;
    },
  },
};
