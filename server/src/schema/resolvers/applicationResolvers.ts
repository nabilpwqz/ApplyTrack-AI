import { GraphQLContext } from '../../context';

export const applicationResolvers = {
  Query: {
    applications: async (
      _: unknown,
      { search, status, priority }: { search?: string; status?: string; priority?: string },
      ctx: GraphQLContext
    ) => {
      const where: Record<string, unknown> = {};

      if (status && status !== 'all') {
        where.status = status;
      }
      if (priority && priority !== 'all') {
        where.priority = priority;
      }
      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { company: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ];
      }

      return ctx.prisma.application.findMany({
        where,
        include: { timeline: { orderBy: { createdAt: 'desc' } } },
        orderBy: { id: 'desc' },
      });
    },

    application: async (_: unknown, { id }: { id: number }, ctx: GraphQLContext) => {
      return ctx.prisma.application.findUnique({
        where: { id },
        include: { timeline: { orderBy: { createdAt: 'desc' } } },
      });
    },

    emailImports: async (_: unknown, { status }: { status?: string }, ctx: GraphQLContext) => {
      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      return ctx.prisma.emailImport.findMany({
        where,
        orderBy: { id: 'desc' },
      });
    },

    analyticsSummary: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const apps = await ctx.prisma.application.findMany({});
      const total = apps.length;
      const active = apps.filter(
        (a) => !['rejected', 'withdrawn', 'accepted'].includes(a.status)
      ).length;
      const interviews = apps.filter(
        (a) => a.status === 'interview' || a.status === 'final_interview'
      ).length;
      const offers = apps.filter((a) => a.status === 'offer' || a.status === 'accepted').length;
      const rejections = apps.filter((a) => a.status === 'rejected').length;

      const responded = apps.filter((a) =>
        ['interview', 'final_interview', 'offer', 'accepted'].includes(a.status)
      ).length;
      const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

      const statusMap: Record<string, number> = {};
      const priorityMap: Record<string, number> = {};

      for (const a of apps) {
        statusMap[a.status] = (statusMap[a.status] || 0) + 1;
        priorityMap[a.priority] = (priorityMap[a.priority] || 0) + 1;
      }

      return {
        totalApplications: total,
        activeOpportunities: active,
        interviewsCount: interviews,
        offersCount: offers,
        rejectionsCount: rejections,
        responseRate,
        statusDistribution: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
        priorityDistribution: Object.entries(priorityMap).map(([priority, count]) => ({
          priority,
          count,
        })),
      };
    },
  },

  Mutation: {
    createApplication: async (
      _: unknown,
      { input }: { input: Record<string, unknown> },
      ctx: GraphQLContext
    ) => {
      const date = (input.applicationDate as string) || new Date().toISOString().split('T')[0];

      return ctx.prisma.application.create({
        data: {
          company: input.company as string,
          title: input.title as string,
          url: (input.url as string) || null,
          location: (input.location as string) || null,
          workMode: (input.workMode as string) || null,
          employmentType: (input.employmentType as string) || null,
          salaryMin: (input.salaryMin as number) || 0,
          salaryMax: (input.salaryMax as number) || 0,
          applicationDate: date,
          deadline: (input.deadline as string) || null,
          source: (input.source as string) || null,
          priority: (input.priority as string) || 'Medium',
          status: (input.status as string) || 'saved',
          notes: (input.notes as string) || null,
          recruiterName: (input.recruiterName as string) || null,
          recruiterEmail: (input.recruiterEmail as string) || null,
          resumeVersion: (input.resumeVersion as string) || null,
          tags: (input.tags as string[]) || [],
          userId: ctx.user?.id || null,
          timeline: {
            create: [
              {
                date,
                event: 'Application added to tracker',
                type: 'submitted',
              },
            ],
          },
        },
        include: { timeline: true },
      });
    },

    updateApplication: async (
      _: unknown,
      { id, input }: { id: number; input: Record<string, unknown> },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.application.update({
        where: { id },
        data: {
          company: input.company as string,
          title: input.title as string,
          url: (input.url as string) || null,
          location: (input.location as string) || null,
          workMode: (input.workMode as string) || null,
          employmentType: (input.employmentType as string) || null,
          salaryMin: (input.salaryMin as number) || 0,
          salaryMax: (input.salaryMax as number) || 0,
          applicationDate: (input.applicationDate as string) || null,
          deadline: (input.deadline as string) || null,
          source: (input.source as string) || null,
          priority: (input.priority as string) || 'Medium',
          status: (input.status as string) || 'saved',
          notes: (input.notes as string) || null,
          recruiterName: (input.recruiterName as string) || null,
          recruiterEmail: (input.recruiterEmail as string) || null,
          resumeVersion: (input.resumeVersion as string) || null,
          tags: (input.tags as string[]) || [],
        },
        include: { timeline: true },
      });
    },

    deleteApplication: async (_: unknown, { id }: { id: number }, ctx: GraphQLContext) => {
      await ctx.prisma.application.delete({ where: { id } });
      return true;
    },

    updateApplicationStatus: async (
      _: unknown,
      { id, status }: { id: number; status: string },
      ctx: GraphQLContext
    ) => {
      const today = new Date().toISOString().split('T')[0];
      return ctx.prisma.application.update({
        where: { id },
        data: {
          status,
          timeline: {
            create: {
              date: today,
              event: `Stage shifted to ${status}`,
              type: status,
            },
          },
        },
        include: { timeline: true },
      });
    },

    toggleInterviewPrepItem: async (
      _: unknown,
      { applicationId, item, checked }: { applicationId: number; item: string; checked: boolean },
      ctx: GraphQLContext
    ) => {
      const app = await ctx.prisma.application.findUnique({ where: { id: applicationId } });
      if (!app) throw new Error('Application not found');

      let prep: Record<string, boolean> = {};
      if (app.interviewPrep) {
        try {
          prep = JSON.parse(app.interviewPrep);
        } catch {
          prep = {};
        }
      }
      prep[item] = checked;

      return ctx.prisma.application.update({
        where: { id: applicationId },
        data: { interviewPrep: JSON.stringify(prep) },
        include: { timeline: true },
      });
    },

    processEmailImport: async (
      _: unknown,
      { id, action }: { id: number; action: string },
      ctx: GraphQLContext
    ) => {
      const emailImport = await ctx.prisma.emailImport.findUnique({ where: { id } });
      if (!emailImport) throw new Error('Import item not found');

      if (action === 'accept') {
        let extracted: Record<string, unknown> = {};
        try {
          extracted = JSON.parse(emailImport.extractData);
        } catch {
          extracted = {};
        }

        await ctx.prisma.application.create({
          data: {
            company: emailImport.company,
            title: emailImport.title,
            status: (extracted.status as string) || 'applied',
            recruiterName: (extracted.recruiterName as string) || null,
            recruiterEmail: (extracted.recruiterEmail as string) || null,
            source: 'Email',
            priority: 'Medium',
            applicationDate: emailImport.detectedDate,
            timeline: {
              create: [
                {
                  date: emailImport.detectedDate,
                  event: `Imported from email: ${emailImport.emailSubject}`,
                  type: 'submitted',
                },
              ],
            },
          },
        });

        await ctx.prisma.emailImport.update({
          where: { id },
          data: { status: 'imported' },
        });
      } else {
        await ctx.prisma.emailImport.update({
          where: { id },
          data: { status: 'dismissed' },
        });
      }

      return true;
    },
  },
};
