/**
 * Cleanup service for old verification requests and photos
 */

import cron from 'node-cron';
import prisma from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { botLogger } from '../utils/botLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cleanup old verification requests
 */
const cleanupOldVerifications = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Delete old approved/rejected requests (older than 30 days)
    const oldRequests = await prisma.verificationRequest.findMany({
      where: {
        OR: [
          { status: 'approved', submitted_at: { lt: thirtyDaysAgo } },
          { status: 'rejected', submitted_at: { lt: sevenDaysAgo } },
        ],
      },
      select: {
        id: true,
        photo_url: true,
        status: true,
      },
    });

    let deletedCount = 0;
    let photoDeletedCount = 0;

    for (const request of oldRequests) {
      // Delete photo file if exists
      if (request.photo_url) {
        try {
          const photoPath = path.join(__dirname, '../../', request.photo_url);
          if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
            photoDeletedCount++;
          }
        } catch (error) {
          botLogger.warn(`Failed to delete photo for request ${request.id}:`, error);
        }
      }

      // Delete request
      await prisma.verificationRequest.delete({
        where: { id: request.id },
      });
      deletedCount++;
    }

    if (deletedCount > 0) {
      botLogger.info(`Cleanup: Deleted ${deletedCount} old verification requests and ${photoDeletedCount} photos`);
    }
  } catch (error) {
    botLogger.error('Error during verification cleanup:', error);
  }
};

/**
 * Cleanup orphaned photos (photos without verification requests)
 */
const cleanupOrphanedPhotos = async () => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads/verifications');
    
    if (!fs.existsSync(uploadsDir)) {
      return;
    }

    // Get all verification requests with photos
    const requestsWithPhotos = await prisma.verificationRequest.findMany({
      where: {
        photo_url: { not: null },
      },
      select: {
        photo_url: true,
      },
    });

    const validPhotoPaths = new Set(
      requestsWithPhotos
        .map(r => r.photo_url)
        .filter(Boolean)
        .map(url => path.basename(url))
    );

    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir);
    let deletedCount = 0;

    for (const file of files) {
      if (!validPhotoPaths.has(file)) {
        try {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          
          // Only delete files older than 7 days
          const fileAge = Date.now() - stats.mtimeMs;
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          
          if (fileAge > sevenDays) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        } catch (error) {
          botLogger.warn(`Failed to delete orphaned photo ${file}:`, error);
        }
      }
    }

    if (deletedCount > 0) {
      botLogger.info(`Cleanup: Deleted ${deletedCount} orphaned photos`);
    }
  } catch (error) {
    botLogger.error('Error during orphaned photos cleanup:', error);
  }
};

/**
 * Initialize cleanup service
 */
export const initializeCleanupService = () => {
  botLogger.info('Initializing cleanup service...');

  // Run cleanup daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    botLogger.info('Running scheduled cleanup...');
    await cleanupOldVerifications();
    await cleanupOrphanedPhotos();
  });

  // Run cleanup on startup (after 1 minute delay)
  setTimeout(async () => {
    botLogger.info('Running initial cleanup...');
    await cleanupOldVerifications();
    await cleanupOrphanedPhotos();
  }, 60 * 1000);

  botLogger.info('Cleanup service initialized');
};
