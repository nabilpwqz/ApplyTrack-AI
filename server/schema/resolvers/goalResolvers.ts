import { GraphQLContext } from '../../context';

export const goalResolvers = {
  Query: {
    careerGoals: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      let goals = await ctx.prisma.careerGoal.findFirst();
      if (!goals) {
        goals = await ctx.prisma.careerGoal.create({
          data: {
            weeklyApplications: 5,
            weeklyInterviews: 2,
            targetRole: 'Staff Frontend Engineer',
            targetDate: '',
            notes: '',
            streak: 0,
            lastWeekKey: '',
          },
        });
      }
      return goals;
    },

    briefNotes: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.briefNote.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    },
  },

  Mutation: {
    saveCareerGoals: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: GraphQLContext
    ) => {
      let goals = await ctx.prisma.careerGoal.findFirst();
      if (goals) {
        goals = await ctx.prisma.careerGoal.update({
          where: { id: goals.id },
          data: {
            weeklyApplications: (input.weeklyApplications as number) ?? goals.weeklyApplications,
            weeklyInterviews: (input.weeklyInterviews as number) ?? goals.weeklyInterviews,
            targetRole: (input.targetRole as string) ?? goals.targetRole,
            targetDate: (input.targetDate as string) ?? goals.targetDate,
            notes: (input.notes as string) ?? goals.notes,
          },
        });
      } else {
        goals = await ctx.prisma.careerGoal.create({
          data: {
            weeklyApplications: (input.weeklyApplications as number) ?? 5,
            weeklyInterviews: (input.weeklyInterviews as number) ?? 2,
            targetRole: (input.targetRole as string) ?? '',
            targetDate: (input.targetDate as string) ?? '',
            notes: (input.notes as string) ?? '',
            streak: 0,
          },
        });
      }
      return goals;
    },

    createBriefNote: async (
      _: unknown,
      { text }: { text: string },
      ctx: GraphQLContext
    ) => {
      const today = new Date().toISOString().split('T')[0];
      return ctx.prisma.briefNote.create({
        data: {
          text,
          date: today,
          userId: ctx.user?.id || null,
        },
      });
    },
  },
};
