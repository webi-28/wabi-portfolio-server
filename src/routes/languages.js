import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM languages WHERE is_active = TRUE ORDER BY sort_order');
    return successResponse(res, rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch languages', 500);
  }
});

router.post('/', authenticate, async (req, res) => {
  const { name, level, proficiency, flag, color, sort_order } = req.body;
  if (!name) return errorResponse(res, 'Name is required', 400);
  try {
    const [rows] = await pool.query(
      'INSERT INTO languages (name, level, proficiency, flag, color, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, level||'Fluent', proficiency||80, flag||'🌍', color||'#2563EB', sort_order||0]
    );
    return successResponse(res, rows[0], 'Language created', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create language', 500);
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { name, level, proficiency, flag, color, sort_order, is_active } = req.body;
  try {
    const [check] = await pool.query('SELECT id FROM languages WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Language not found', 404);
    const [rows] = await pool.query(
      'UPDATE languages SET name=$1, level=$2, proficiency=$3, flag=$4, color=$5, sort_order=$6, is_active=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, level, proficiency, flag, color, sort_order??0, is_active??true, req.params.id]
    );
    return successResponse(res, rows[0], 'Language updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update language', 500);
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM languages WHERE id = $1', [req.params.id]);
    return successResponse(res, null, 'Language deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete language', 500);
  }
});

export default router;
