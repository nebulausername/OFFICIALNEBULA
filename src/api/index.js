// Main API export
import auth from './auth';
import entities from './entities';
import integrations from './integrations';
import admin from './admin';
export const api = {
  auth,
  entities,
  integrations,
  admin,
};

// Also export individual modules
export { auth, entities, integrations, admin };
export { default as apiClient } from './client';

export default api;

