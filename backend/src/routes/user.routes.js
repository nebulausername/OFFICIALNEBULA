import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { listUsers, getUser, updateUser } from '../controllers/user.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { userUpdateSchema } from '../schemas/user.schema.js';

const router = express.Router();

// All user routes require admin authentication
router.use(authenticate);
router.use(requireAdmin); // RBAC Enforcement

// Get all users (for dashboard)
router.get('/', listUsers);

// Get single user
router.get('/:id', getUser);

// Update user (Status/Role)
router.put('/:id', validateRequest(userUpdateSchema), updateUser);

export default router;
