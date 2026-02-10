
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const input = process.argv[2];

async function main() {
    if (!input) {
        console.log('⚠️  Please provide an Email, Telegram ID, or User ID!');
        console.log('👉 Usage: node backend/scripts/make-admin.js <identifier>');

        try {
            const users = await prisma.user.findMany({
                select: { id: true, telegram_id: true, email: true, role: true, full_name: true },
                orderBy: { created_at: 'desc' }
            });

            console.log('\n👥 Available Users (Most recent first):');
            if (users.length === 0) {
                console.log('   (No users found in database)');
            } else {
                console.log('----------------------------------------------------------------------------------------------------------------');
                console.log('| Role | Name                 | Telegram ID  | Email           | ID                                   |');
                console.log('----------------------------------------------------------------------------------------------------------------');
                users.forEach(u => {
                    const isAdmin = u.role === 'admin' ? '👑' : '👤';
                    const name = (u.full_name || 'No Name').padEnd(20).slice(0, 20);
                    const tid = (u.telegram_id ? u.telegram_id.toString() : 'None').padEnd(12);
                    const mail = (u.email || 'None').padEnd(15).slice(0, 15);
                    const id = u.id;
                    console.log(`| ${isAdmin}   | ${name} | ${tid} | ${mail} | ${id} |`);
                });
                console.log('----------------------------------------------------------------------------------------------------------------');
            }
        } catch (error) {
            console.error('Error listing users:', error.message);
        }
        return;
    }

    console.log(`🔍 Finding user with identifier: ${input}...`);

    let where = {};

    // Try to determine input type
    if (input.includes('@')) {
        where = { email: input };
    } else if (/^\d+$/.test(input) && input.length < 15) { // Simple heuristic for Telegram ID (usually < 15 digits)
        where = { telegram_id: BigInt(input) };
    } else {
        // Assume ID (UUID)
        where = { id: input };
    }

    try {
        // First check if user exists to provide better error message
        const existingUser = await prisma.user.findFirst({ where });

        if (!existingUser) {
            console.error(`❌ User not found with identifier "${input}".`);
            console.log('   Run the script without arguments to see the list of users.');
            return;
        }

        const user = await prisma.user.update({
            where: { id: existingUser.id }, // Always update by ID to be safe
            data: {
                role: 'admin',
                verification_status: 'verified', // Admins are automatically verified
                verified_at: new Date()
            },
        });

        console.log(`\n🎉 Success! User "${user.full_name || 'Unknown'}" (ID: ${user.id}) is now an ADMIN.`);
        console.log('👉 You can now access the dashboard at /admin');

    } catch (error) {
        console.error('❌ Error updating user:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
