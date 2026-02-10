// Main API export
import auth from './auth';
import entities from './entities';
import integrations from './integrations';
import admin from './admin';
import verification from './verification';

export const api = {
  auth,
  entities,
  integrations,
  admin,
  verification
};

// Also export individual modules
export { auth, entities, integrations, admin, verification };


export default api;

