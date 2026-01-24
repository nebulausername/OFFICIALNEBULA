
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixAdmin() {
    const telegramId = 8120079318n;

    console.log('Fixing admin user:', telegramId.toString());

    // Find the user by ID
    const user = await prisma.user.findUnique({
        where: { telegram_id: telegramId },
    });

    if (!user) {
        console.log('User not found, creating new admin...');
        await prisma.user.create({
            data: {
                telegram_id: telegramId,
                username: 'admin',
                full_name: 'Admin User',
                role: 'admin',
                is_vip: true,
                verification_status: 'verified',
                email: 'admin@nebula.supply'
            }
        });
    } else {
        console.log('User found, updating role...');
        // Update existing user
        await prisma.user.update({
            where: { telegram_id: telegramId },
            data: {
                role: 'admin',
                is_vip: true,
                verification_status: 'verified',
                email: 'admin@nebula.supply', // Set email so seed works next time
                username: user.username || 'admin', // Keep existing or set default
            }
        });
    }

    console.log('✅ Admin fixed successfully!');
}

fixAdmin()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
