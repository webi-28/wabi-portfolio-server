import { Router } from 'express';
import { body } from 'express-validator';
import { getAll, create, update, remove } from '../controllers/achievementsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getAll);

router.post('/',
  authenticate,
  body('title').notEmpty(),
  body('description').notEmpty(),
  validate,
  create
);

router.put('/:id', authenticate, validate, update);
router.delete('/:id', authenticate, remove);

export default router;
