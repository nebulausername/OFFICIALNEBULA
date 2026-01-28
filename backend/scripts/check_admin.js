
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TELEGRAM_ID = 8120079318n;

async function checkAndPromoteUser() {
    try {
        console.log(`Checking for user with Telegram ID: ${TELEGRAM_ID}`);

        const user = await prisma.user.findFirst({
            where: {
                telegram_id: TELEGRAM_ID,
            },
        });

        if (user) {
            console.log('User found:');
            console.log(`ID: ${user.id}`);
            console.log(`Username: ${user.username}`);
            console.log(`Role: ${user.role}`);
            console.log(`Telegram ID: ${user.telegram_id}`);

            if (user.role !== 'admin') {
                console.log('User is not an admin. Promoting to admin...');
                const updatedUser = await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'admin' },
                });
                console.log('User promoted successfully!');
                console.log(`New Role: ${updatedUser.role}`);
            } else {
                console.log('User is already an admin.');
            }
        } else {
            console.log('User not found in the database. Creating admin user...');
            // Create the user if they don't exist (though they should if they used the bot)
            const newUser = await prisma.user.create({
                data: {
                    telegram_id: TELEGRAM_ID,
                    username: 'AdminUser',
                    full_name: 'Admin User',
                    role: 'admin',
                    verification_status: 'verified', // Admins should be verified
                }
            });
            console.log('Admin user created successfully:', newUser);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndPromoteUser();
