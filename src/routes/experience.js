import { Router } from 'express';
import { body } from 'express-validator';
import { getAll, getById, create, update, remove } from '../controllers/experienceController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);

router.post('/',
  authenticate,
  body('title').notEmpty(),
  body('organization').notEmpty(),
  body('start_date').isDate(),
  body('description').notEmpty(),
  validate,
  create
);

router.put('/:id', authenticate, validate, update);
router.delete('/:id', authenticate, remove);

export default router;
