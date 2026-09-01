import { Router } from 'express';
import { body } from 'express-validator';
import { getAll, getById, create, update, remove } from '../controllers/certificatesController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadCertificate } from '../config/multer.js';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);

router.post('/',
  authenticate,
  uploadCertificate.single('image'),
  body('name').notEmpty(),
  body('organization').notEmpty(),
  body('issue_date').isDate(),
  validate,
  create
);

router.put('/:id', authenticate, uploadCertificate.single('image'), validate, update);
router.delete('/:id', authenticate, remove);

export default router;
