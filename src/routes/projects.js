import { Router } from 'express';
import { body } from 'express-validator';
import { getAll, getBySlug, create, update, remove } from '../controllers/projectsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadProject } from '../config/multer.js';

const router = Router();

// Public
router.get('/', getAll);
router.get('/:slug', getBySlug);

// Protected
router.post('/',
  authenticate,
  uploadProject.single('image'),
  body('title').notEmpty().withMessage('Title is required'),
  body('short_description').notEmpty(),
  body('description').notEmpty(),
  validate,
  create
);

router.put('/:id',
  authenticate,
  uploadProject.single('image'),
  validate,
  update
);

router.delete('/:id', authenticate, remove);

export default router;
