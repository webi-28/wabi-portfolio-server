import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

const router = Router();

const parseEdu = e => ({ ...e, achievements: Array.isArray(e.achievements) ? e.achievements : [] });

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM education ORDER BY sort_order, start_date DESC');
    return successResponse(res, rows.map(parseEdu));
  } catch (err) {
    return errorResponse(res, 'Failed to fetch education', 500);
  }
});

router.post('/', authenticate, async (req, res) => {
  const { institution, degree, field_of_study, gpa, max_gpa, start_date, end_date, is_current, location, description, achievements, sort_order } = req.body;
  if (!institution || !degree || !start_date) return errorResponse(res, 'Required fields missing', 400);
  const achJson = JSON.stringify(Array.isArray(achievements) ? achievements : []);
  try {
    const [rows] = await pool.query(
      `INSERT INTO education (institution, degree, field_of_study, gpa, max_gpa, start_date, end_date, is_current, location, description, achievements, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12) RETURNING *`,
      [institution, degree, field_of_study||'', gpa||null, max_gpa||4.00, start_date, end_date||null, is_current?true:false, location||null, description||null, achJson, sort_order||0]
    );
    return successResponse(res, parseEdu(rows[0]), 'Education created', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create education', 500);
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { institution, degree, field_of_study, gpa, max_gpa, start_date, end_date, is_current, location, description, achievements, sort_order } = req.body;
  try {
    const [check] = await pool.query('SELECT * FROM education WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Education not found', 404);
    const p = check[0];
    const achJson = JSON.stringify(achievements || p.achievements || []);
    const [rows] = await pool.query(
      `UPDATE education SET institution=$1, degree=$2, field_of_study=$3, gpa=$4, max_gpa=$5, start_date=$6,
       end_date=$7, is_current=$8, location=$9, description=$10, achievements=$11::jsonb, sort_order=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [institution||p.institution, degree||p.degree, field_of_study||p.field_of_study, gpa??p.gpa, max_gpa||p.max_gpa,
       start_date||p.start_date, end_date??p.end_date, is_current??p.is_current, location??p.location,
       description??p.description, achJson, sort_order??p.sort_order, req.params.id]
    );
    return successResponse(res, parseEdu(rows[0]), 'Education updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update education', 500);
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM education WHERE id = $1', [req.params.id]);
    return successResponse(res, null, 'Education deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete education', 500);
  }
});

export default router;
