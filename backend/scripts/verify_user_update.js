
import prisma from '../src/config/database.js';
import { updateUser } from '../src/controllers/user.controller.js';

// Mock Express Request/Response
const mockReq = (params, body) => ({
    params,
    body
});

const mockRes = () => {
    const res = {};
    res.json = (data) => {
        res.data = data;
        return res;
    };
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    return res;
};

const mockNext = (err) => {
    console.error("Next called with error:", err);
};

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

async function verifyUserUpdate() {
    console.log("Starting verification of User Update Logic...");

    // 1. Create a Test User
    const testEmail = `testuser_${Date.now()}@example.com`;
    let user;
    try {
        console.log("Creating test user...");
        user = await prisma.user.create({
            data: {
                email: testEmail,
                full_name: 'Test Verification User',
                username: `test_${Date.now()}`,
                // password removed as it is not in schema
                role: 'user',
                is_vip: false
            }
        });
        console.log(`Created test user: ${user.email} (ID: ${user.id})`);
    } catch (createError) {
        console.error("FATAL: Failed to create test user:", createError);
        process.exit(1);
    }

    try {
        console.log(`Initial Status: Role=${user.role}, VIP=${user.is_vip}`);

        // 2. Test Updating VIP Status (mimicking AdminUsers.jsx toggle)
        console.log("Testing Update: Toggle VIP to TRUE...");
        let req = mockReq({ id: user.id }, { is_vip: true });
        let res = mockRes();

        await updateUser(req, res, mockNext);

        if (res.data && res.data.is_vip === true) {
            console.log("SUCCESS: User updated via controller. Response data:", res.data);
        } else {
            console.error("FAILURE: Controller response did not show is_vip=true. Data:", res.data);
            throw new Error("Controller response mismatch");
        }

        // Verify in DB
        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (updatedUser.is_vip === true) {
            console.log("DB VERIFICATION: User is_vip is TRUE in database.");
        } else {
            console.error("DB FAILURE: User is_vip is NOT TRUE in database.");
            throw new Error("DB verification failed");
        }

        // 3. Test Updating Role via same endpoint
        console.log("Testing Update: Change Role to 'admin'...");
        req = mockReq({ id: user.id }, { role: 'admin' });
        res = mockRes();

        await updateUser(req, res, mockNext);

        if (res.data && res.data.role === 'admin') {
            console.log("SUCCESS: Role updated via controller. Response data:", res.data);
        } else {
            console.error("FAILURE: Role not updated.");
            throw new Error("Role update failed");
        }

    } catch (error) {
        console.error("Verification Script Error:", error);
    } finally {
        if (user && user.id) {
            try {
                await prisma.user.delete({ where: { id: user.id } });
                console.log("Cleanup: Test user deleted.");
            } catch (cleanupError) {
                console.error("Cleanup Error:", cleanupError);
            }
        }
        await prisma.$disconnect();
    }
}

verifyUserUpdate();
