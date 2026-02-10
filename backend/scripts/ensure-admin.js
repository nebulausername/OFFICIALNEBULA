
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_TELEGRAM_ID = 8120079318n; // BigInt literal
const TARGET_USERNAME = 'Admin';

async function main() {
    console.log(`🔍 Checking for user with Telegram ID: ${TARGET_TELEGRAM_ID}...`);

    const user = await prisma.user.findUnique({
        where: { telegram_id: TARGET_TELEGRAM_ID },
    });

    if (user) {
        console.log(`✅ User found: ${user.username || 'No Username'} (${user.id})`);

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                role: 'admin',
                username: TARGET_USERNAME,
                verification_status: 'verified', // Ensure they pass protected route checks
                rank: 'nebula' // Max rank for fun
            }
        });
        console.log(`🎉 User updated to ADMIN and VERIFIED.`);
    } else {
        console.log(`⚠️ User not found. Creating new Admin user...`);

        const newUser = await prisma.user.create({
            data: {
                telegram_id: TARGET_TELEGRAM_ID,
                username: TARGET_USERNAME,
                full_name: 'Admin User',
                role: 'admin',
                verification_status: 'verified',
                rank: 'nebula',
                is_vip: true
            }
        });
        console.log(`🎉 Created new ADMIN user: ${newUser.username} (${newUser.id})`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
