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
            apiKey, // Use apiKey param which fits both service and anon keys in the SDK
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
    if (!insforge) initializeStorage();
    if (!insforge) return null;

    const bucketName = getEnv('INSFORGE_BUCKET_VERIFICATIONS', 'verifications');

    try {
        // Convert buffer to Blob/File object as SDK expects
        // Node.js doesn't have native File/Blob in older versions, but we can pass buffer if SDK supports it.
        // The @insforge/sdk often expects a standard Request body format. 
        // If SDK runs in Node, we might need a Blob polyfill or pass Buffer directly if supported.
        // Based on docs: upload(path, file) where file is File | Blob.

        // Polyfill Blob if needed (Node 18+ has global Blob)
        const blob = new Blob([buffer], { type: mimeType });

        const { data, error } = await insforge.storage
            .from(bucketName)
            .upload(filename, blob);

        if (error) {
            botLogger.error('InsForge Upload Error:', error);
            return null;
        }

        return {
            url: data.url,
            key: data.key
        };
    } catch (error) {
        botLogger.error('Storage Service Error:', error);
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
