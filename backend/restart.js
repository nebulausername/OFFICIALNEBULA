/**
 * Restart script for backend server
 * This script stops any running processes, regenerates Prisma client, and restarts the server
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function restart() {
    console.log('🔄 Restarting backend server...\n');

    try {
        // Step 1: Kill any existing node processes on port 8000
        console.log('1️⃣ Stopping existing server processes...');
        try {
            if (process.platform === 'win32') {
                await execAsync('FOR /F "tokens=5" %P IN (\'netstat -ano ^| findstr :8000\') DO taskkill /PID %P /F');
            } else {
                await execAsync('lsof -ti:8000 | xargs kill -9');
            }
            console.log('✅ Stopped existing processes\n');
        } catch (e) {
            console.log('ℹ️ No existing processes found\n');
        }

        // Step 2: Regenerate Prisma Client
        console.log('2️⃣ Regenerating Prisma Client...');
        const { stdout: prismaOut } = await execAsync('npx prisma generate');
        console.log(prismaOut);
        console.log('✅ Prisma Client regenerated\n');

        // Step 3: Start the server
        console.log('3️⃣ Starting server...');
        const server = exec('npm run dev');

        server.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        server.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        server.on('exit', (code) => {
            console.log(`Server exited with code ${code}`);
        });

        console.log('✅ Server started successfully!\n');
    } catch (error) {
        console.error('❌ Error during restart:', error.message);
        process.exit(1);
    }
}

restart();
