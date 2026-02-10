import { createClient } from '@insforge/sdk';
import { getEnv } from '../config/env.js';
import { botLogger } from '../utils/botLogger.js';

let insforge = null;

/**
 * Initialize InsForge Client
 */
export const initializeStorage = () => {
    const baseUrl = getEnv('INSFORGE_BASE_URL');
    const apiKey = getEnv('INSFORGE_API_KEY') || getEnv('INSFORGE_ANON_KEY'); // Fallback to anon key if service key not set

    if (!baseUrl || !apiKey) {
        botLogger.warn('InsForge credentials not found. Storage service will be disabled.');
        return null;
    }

    try {
        insforge = createClient({
            baseUrl,
            apiKey: apiKey,
        });
        botLogger.info('✅ InsForge Storage Service initialized');
        return insforge;
    } catch (error) {
        botLogger.error('Failed to initialize InsForge:', error);
        return null;
    }
};

/**
 * Upload file to InsForge Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Target filename
 * @param {string} mimeType - File mime type
 * @returns {Promise<{url: string, key: string} | null>}
 */
export const uploadVerificationPhoto = async (buffer, filename, mimeType = 'image/jpeg') => {
    if (!insforge) {
        initializeStorage();
        if (!insforge) {
            console.error('Storage service not initialized');
            return null;
        }
    }

    const bucketName = getEnv('INSFORGE_BUCKET_VERIFICATIONS') || 'verifications';

    try {
        // Ensure bucket exists
        const { error: bucketError } = await insforge.storage.getBucket(bucketName);
        if (bucketError) {
            console.log(`Bucket ${bucketName} not found, attempting to create...`);
            const { error: createError } = await insforge.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/jpeg', 'image/png']
            });
            if (createError) {
                console.error('Failed to create bucket:', createError);
                // Continue anyway, maybe getBucket failed due to permissions but upload might work if it exists
            }
        }

        const blob = new Blob([buffer], { type: mimeType });
        const { data, error } = await insforge.storage
            .from(bucketName)
            .upload(filename, blob, {
                upsert: true
            });

        if (error) {
            console.error('InsForge Upload Error detailed:', error);
            return null;
        }

        // Get public URL
        const { data: publicUrlData } = insforge.storage
            .from(bucketName)
            .getPublicUrl(filename);

        return {
            url: publicUrlData.publicUrl,
            key: filename
        };
    } catch (error) {
        console.error('Storage Service Exception:', error);
        return null;
    }
};

/**
 * Get public URL for a file
 * @param {string} key - File key
 * @returns {string}
 */
export const getPublicUrl = (key) => {
    if (!insforge) initializeStorage();
    if (!insforge) return '';

    const bucketName = getEnv('INSFORGE_BUCKET_VERIFICATIONS', 'verifications');
    // Construct URL manually or use SDK if available
    // SDK returns full URL on upload, so we might just store that.
    return `${getEnv('INSFORGE_BASE_URL')}/storage/v1/object/public/${bucketName}/${key}`;
};
