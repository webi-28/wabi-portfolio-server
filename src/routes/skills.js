import { Router } from 'express';
import { body } from 'express-validator';
import { getAll, getById, create, update, remove } from '../controllers/skillsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);

router.post('/',
  authenticate,
  body('name').notEmpty().withMessage('Name required'),
  body('category').isIn(['frontend','backend','programming','database','tools','devops','other']).withMessage('Invalid category'),
  body('proficiency').isInt({ min: 0, max: 100 }),
  validate,
  create
);

router.put('/:id', authenticate, validate, update);
router.delete('/:id', authenticate, remove);

export default router;
