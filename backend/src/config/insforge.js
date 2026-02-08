import { createClient } from '@insforge/sdk';
import { getEnv } from './env.js';

let insforge = null;

export const getInsForgeClient = () => {
    if (insforge) return insforge;

    const baseUrl = getEnv('INSFORGE_BASE_URL');
    const apiKey = getEnv('INSFORGE_API_KEY');

    if (baseUrl && apiKey) {
        insforge = createClient({
            baseUrl,
            apiKey,
        });
    }

    return insforge;
};
