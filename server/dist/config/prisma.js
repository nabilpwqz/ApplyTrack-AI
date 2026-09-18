import { PrismaClient } from '@prisma/client';
let prisma;
try {
    prisma = new PrismaClient({
        log: ['error', 'warn'],
    });
}
catch (err) {
    console.warn('⚠️ Prisma Client initialization fallback:', err);
    prisma = new PrismaClient();
}
export default prisma;
