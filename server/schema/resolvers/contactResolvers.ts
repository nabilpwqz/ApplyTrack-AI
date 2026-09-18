import { GraphQLContext } from '../../context';

export const contactResolvers = {
  Query: {
    networkContacts: async (
      _: unknown,
      { search, role }: { search?: string; role?: string },
      ctx: GraphQLContext
    ) => {
      const where: Record<string, unknown> = {};

      if (role && role.trim()) {
        where.role = role.trim();
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { role: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ];
      }

      return ctx.prisma.networkContact.findMany({
        where,
        orderBy: { id: 'desc' },
      });
    },
  },

  Mutation: {
    createContact: async (
      _: unknown,
      { input }: { input: { name: string; role: string; company: string; email?: string; notes?: string } },
      ctx: GraphQLContext
    ) => {
      const lastTouch = new Date().toISOString().split('T')[0];
      return ctx.prisma.networkContact.create({
        data: {
          name: input.name,
          role: input.role,
          company: input.company,
          email: input.email || null,
          notes: input.notes || null,
          lastTouch,
          userId: ctx.user?.id || null,
        },
      });
    },

    updateContact: async (
      _: unknown,
      { id, input }: { id: number; input: { name: string; role: string; company: string; email?: string; notes?: string } },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.networkContact.update({
        where: { id },
        data: {
          name: input.name,
          role: input.role,
          company: input.company,
          email: input.email || null,
          notes: input.notes || null,
        },
      });
    },

    deleteContact: async (_: unknown, { id }: { id: number }, ctx: GraphQLContext) => {
      await ctx.prisma.networkContact.delete({ where: { id } });
      return true;
    },
  },
};
