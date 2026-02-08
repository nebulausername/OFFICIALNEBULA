/**
 * InsForge Client Configuration
 * Backend-as-a-Service for OFFICIALNEBULA
 */
import { createClient } from '@insforge/sdk';

// Environment variables (Vite injects these)
const baseUrl = import.meta.env.VITE_INSFORGE_BASE_URL || 'https://p5nhx8uz.eu-central.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || '';

// Create and export the InsForge client
export const insforge = createClient({
    baseUrl,
    anonKey,
});

// Export individual services for convenience
export const db = insforge.database;
export const storage = insforge.storage;
export const auth = insforge.auth;

export default insforge;
