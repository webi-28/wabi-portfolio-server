import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { uploadProfile } from '../config/multer.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/cv');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, 'wabi-worku-cv.pdf'),
});
const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
});

const router = Router();

// Public — get all settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT key, value, type FROM settings');
    const settings = rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
    return successResponse(res, settings);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch settings', 500);
  }
});

// Protected — update settings
router.put('/', authenticate, async (req, res) => {
  const updates = req.body;
  try {
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
        [key, value]
      );
    }
    return successResponse(res, null, 'Settings updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update settings', 500);
  }
});

// Upload profile image
router.post('/profile-image', authenticate, uploadProfile.single('image'), async (req, res) => {
  if (!req.file) return errorResponse(res, 'No file uploaded', 400);
  const imagePath = `/uploads/profile/${req.file.filename}`;
  await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
    ['profile_image', imagePath]
  );
  return successResponse(res, { path: imagePath }, 'Profile image updated');
});

// Upload CV
router.post('/cv', authenticate, uploadCV.single('cv'), async (req, res) => {
  if (!req.file) return errorResponse(res, 'No file uploaded', 400);
  const cvPath = '/uploads/cv/wabi-worku-cv.pdf';
  await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
    ['cv_url', cvPath]
  );
  return successResponse(res, { path: cvPath }, 'CV uploaded successfully');
});

// Download CV
router.get('/cv/download', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT value FROM settings WHERE key = 'cv_url'");
    const cvPath = rows[0]?.value;
    if (cvPath) {
      const uploadedFile = path.join(__dirname, '../../', cvPath);
      if (fs.existsSync(uploadedFile)) return res.download(uploadedFile, 'WEBI-WORKU-ALEMU-Resume.pdf');
    }
    const staticFile = path.join(__dirname, '../../../client/public/downloads/wabi-worku-cv.pdf');
    if (fs.existsSync(staticFile)) return res.download(staticFile, 'WEBI-WORKU-ALEMU-Resume.pdf');
    return errorResponse(res, 'CV not found. Please upload your CV from the admin panel.', 404);
  } catch (err) {
    return errorResponse(res, 'Failed to download CV', 500);
  }
});

export default router;
