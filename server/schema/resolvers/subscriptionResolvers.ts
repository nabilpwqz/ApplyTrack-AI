import crypto from 'crypto';
import { GraphQLContext } from '../../context';

function generateTxnId(method: string): string {
  const methodCode = method.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'CARD';
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `TXN-${dateCode}-${methodCode}-${random}`;
}

function generateGatewayRef(method: string): string {
  const methodCode = method.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'GW';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GW-${methodCode}-${random}`;
}

export const subscriptionResolvers = {
  Query: {
    subscription: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      let sub = await ctx.prisma.subscription.findFirst({
        where: ctx.user ? { userId: ctx.user.id } : {},
        orderBy: { updatedAt: 'desc' },
      });

      if (!sub) {
        sub = await ctx.prisma.subscription.create({
          data: {
            plan: 'free',
            status: 'approved',
            method: 'International payment',
            userId: ctx.user?.id || null,
          },
        });
      }
      return sub;
    },

    billingTransactions: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.billingTransaction.findMany({
        where: ctx.user ? { userId: ctx.user.id } : {},
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    },
  },

  Mutation: {
    saveSubscription: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          plan: string;
          method: string;
          email?: string;
          currency?: string;
          amount?: string;
        };
      },
      ctx: GraphQLContext
    ) => {
      const isPremium = input.plan === 'premium';
      const status = isPremium ? 'pending' : 'approved';
      const amount = input.amount || (isPremium ? '19.00' : '0.00');
      const currency = input.currency || 'USD';

      let sub = await ctx.prisma.subscription.findFirst({
        where: ctx.user ? { userId: ctx.user.id } : {},
      });

      if (sub) {
        sub = await ctx.prisma.subscription.update({
          where: { id: sub.id },
          data: {
            plan: isPremium ? sub.plan : 'free',
            requestedPlan: isPremium ? 'premium' : null,
            status,
            method: input.method,
            amount,
            currency,
            requestedAt: isPremium ? new Date() : null,
          },
        });
      } else {
        sub = await ctx.prisma.subscription.create({
          data: {
            userId: ctx.user?.id || null,
            plan: isPremium ? 'free' : 'free',
            requestedPlan: isPremium ? 'premium' : null,
            status,
            method: input.method,
            amount,
            currency,
            requestedAt: isPremium ? new Date() : null,
          },
        });
      }

      if (isPremium) {
        // Record transaction
        const txnId = generateTxnId(input.method);
        const gateway = generateGatewayRef(input.method);
        const time = new Date().toLocaleTimeString();

        await ctx.prisma.billingTransaction.create({
          data: {
            userId: ctx.user?.id || null,
            txnId,
            time,
            method: input.method,
            gateway,
            amount,
            currency,
            status: 'pending_approval',
            message: `${input.method} payment submitted for verification`,
          },
        });
      }

      return sub;
    },

    approvePremium: async (
      _: unknown,
      { subscriptionId }: { subscriptionId: string },
      ctx: GraphQLContext
    ) => {
      const sub = await ctx.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          plan: 'premium',
          status: 'approved',
          approvedAt: new Date(),
        },
      });

      if (sub.userId) {
        await ctx.prisma.user.update({
          where: { id: sub.userId },
          data: { plan: 'premium' },
        });
      }

      return sub;
    },
  },
};
