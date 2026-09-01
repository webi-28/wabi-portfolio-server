import { Router } from 'express';
import { body } from 'express-validator';
import { create, getAll, updateStatus, remove, getStats } from '../controllers/messagesController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Public — submit contact form
router.post('/',
  body('name').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('subject').notEmpty().trim().isLength({ min: 3, max: 300 }),
  body('message').notEmpty().trim().isLength({ min: 10, max: 5000 }),
  validate,
  create
);

// Protected
router.get('/', authenticate, getAll);
router.get('/stats', authenticate, getStats);
router.put('/:id/status', authenticate, body('status').isIn(['unread','read','replied','archived']), validate, updateStatus);
router.delete('/:id', authenticate, remove);

export default router;
