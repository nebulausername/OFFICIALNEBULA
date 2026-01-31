const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        console.log("🔍 Checking Database Data...");

        const categories = await prisma.category.findMany();
        console.log(`📂 Categories found: ${categories.length}`);
        if (categories.length > 0) {
            console.log("Sample:", categories[0]);
        }

        const brands = await prisma.brand.findMany();
        console.log(`🏷️ Brands found: ${brands.length}`);
        if (brands.length > 0) {
            console.log("Sample:", brands[0]);
        }

        const products = await prisma.product.findMany();
        console.log(`📦 Products found: ${products.length}`);

    } catch (error) {
        console.error("❌ Error checking data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
