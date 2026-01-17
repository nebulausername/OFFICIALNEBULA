import express from 'express';
import * as ticketController from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateTicket, validateId, validatePagination } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate); // All ticket routes require authentication

router.get('/', validatePagination, ticketController.listTickets);
router.get('/:id', validateId, ticketController.getTicket);
router.post('/', validateTicket, ticketController.createTicket);
router.post('/:id/messages', validateId, ticketController.sendMessage);
router.patch('/:id/status', validateId, requireAdmin, ticketController.updateTicketStatus);

export default router;

