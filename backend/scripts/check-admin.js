
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdmin() {
    const telegramId = 8120079318n; // Use BigInt for BigInt field
    console.log('Checking for user with Telegram ID:', telegramId.toString());

    const user = await prisma.user.findUnique({
        where: { telegram_id: telegramId },
    });

    if (!user) {
        console.log('❌ User NOT found!');
    } else {
        console.log('✅ User found:', user.email);
        console.log('Role:', user.role);
        console.log('Verification Status:', user.verification_status);
    }

    // Check what the bot queries
    const admins = await prisma.user.findMany({
        where: {
            role: { in: ['admin', 'superadmin'] },
            telegram_id: { not: null }
        }
    });

    console.log('Found admins:', admins.length);
    admins.forEach(a => console.log(`- ${a.username} (${a.role})`));
}

checkAdmin()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
