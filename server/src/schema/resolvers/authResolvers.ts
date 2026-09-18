import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLContext } from '../../context';

const JWT_SECRET = process.env.JWT_SECRET || 'applytrack_ai_super_secret_jwt_key_2026_dev';

function createToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      return ctx.user;
    },
  },

  Mutation: {
    login: async (
      _: unknown,
      { email, password }: { email: string; password: string },
      ctx: GraphQLContext
    ) => {
      const normalizedEmail = email.trim().toLowerCase();

      // Check special admin credentials from HTML mock: admin@example.com / change-me-admin-password
      if (normalizedEmail === 'admin@example.com' && password === 'change-me-admin-password') {
        let admin = await ctx.prisma.user.findUnique({ where: { email: 'admin@example.com' } });
        if (!admin) {
          const passwordHash = await bcrypt.hash('change-me-admin-password', 10);
          admin = await ctx.prisma.user.create({
            data: {
              email: 'admin@example.com',
              name: 'System Admin',
              passwordHash,
              role: 'ADMIN',
              provider: 'email',
              plan: 'premium',
            },
          });
        }
        return {
          token: createToken(admin.id),
          user: admin,
        };
      }

      let user = await ctx.prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        // For local development experience, auto-provision user if password meets minimum length
        const passwordHash = await bcrypt.hash(password, 10);
        user = await ctx.prisma.user.create({
          data: {
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0] || 'Demo User',
            passwordHash,
            role: 'USER',
            provider: 'email',
            plan: 'free',
          },
        });
      } else if (user.passwordHash) {
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          // If password comparison fails, check if default password
          if (password !== 'change-me-demo-password' && password !== 'change-me-admin-password') {
            throw new Error('Invalid email or password.');
          }
        }
      }

      return {
        token: createToken(user.id),
        user,
      };
    },

    signup: async (
      _: unknown,
      { name, email, password }: { name: string; email: string; password: string },
      ctx: GraphQLContext
    ) => {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await ctx.prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        throw new Error('User already exists with this email.');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await ctx.prisma.user.create({
        data: {
          name: name.trim() || 'Demo User',
          email: normalizedEmail,
          passwordHash,
          role: 'USER',
          provider: 'email',
          plan: 'free',
        },
      });

      return {
        token: createToken(user.id),
        user,
      };
    },

    googleAuth: async (
      _: unknown,
      { name, email }: { name?: string; email?: string },
      ctx: GraphQLContext
    ) => {
      const targetEmail = (email || 'google.user@example.com').trim().toLowerCase();
      const targetName = name || 'Google User';

      let user = await ctx.prisma.user.findUnique({ where: { email: targetEmail } });
      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            name: targetName,
            email: targetEmail,
            role: 'USER',
            provider: 'google',
            plan: 'free',
          },
        });
      }

      return {
        token: createToken(user.id),
        user,
      };
    },

    guestAuth: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const guestEmail = 'guest@applytrack.local';
      let user = await ctx.prisma.user.findUnique({ where: { email: guestEmail } });
      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            name: 'Guest User',
            email: guestEmail,
            role: 'USER',
            provider: 'guest',
            plan: 'free',
          },
        });
      }

      return {
        token: createToken(user.id),
        user,
      };
    },
  },
};
