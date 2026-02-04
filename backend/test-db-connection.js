import prisma from './src/config/database.js';

async function testConnection() {
    console.log('🔍 Testing database connection...\n');

    try {
        // Test raw query
        console.log('1️⃣ Testing raw SQL query...');
        await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Raw query successful\n');

        // Test model query
        console.log('2️⃣ Testing Product model query...');
        const count = await prisma.product.count();
        console.log(`✅ Found ${count} products\n`);

        // Get database info
        console.log('3️⃣ Fetching database statistics...');
        const [users, products, categories, brands] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.category.count(),
            prisma.brand.count(),
        ]);

        console.log(`✅ Database Statistics:`);
        console.log(`   - Users: ${users}`);
        console.log(`   - Products: ${products}`);
        console.log(`   - Categories: ${categories}`);
        console.log(`   - Brands: ${brands}\n`);

        console.log('✅ All database tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection test failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code || 'N/A'}`);
        if (error.stack) {
            console.error(`\nStack trace:\n${error.stack}`);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
