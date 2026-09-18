import { GraphQLContext } from '../../context';

export const storyResolvers = {
  Query: {
    stories: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.story.findMany({
        orderBy: { id: 'desc' },
      });
    },
  },

  Mutation: {
    createStory: async (
      _: unknown,
      { input }: { input: { title: string; tags?: string[]; situation?: string; task?: string; action?: string; result?: string } },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.story.create({
        data: {
          title: input.title,
          tags: input.tags || [],
          situation: input.situation || null,
          task: input.task || null,
          action: input.action || null,
          result: input.result || null,
          userId: ctx.user?.id || null,
        },
      });
    },

    deleteStory: async (_: unknown, { id }: { id: number }, ctx: GraphQLContext) => {
      await ctx.prisma.story.delete({ where: { id } });
      return true;
    },
  },
};
