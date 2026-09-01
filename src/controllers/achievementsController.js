import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM achievements WHERE is_active = TRUE ORDER BY sort_order, created_at');
    return successResponse(res, rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch achievements', 500);
  }
};

export const create = async (req, res) => {
  const { title, description, icon, color, date, issuer, sort_order } = req.body;
  try {
    const [rows] = await pool.query(
      'INSERT INTO achievements (title, description, icon, color, date, issuer, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, description, icon||null, color||'#2563EB', date||null, issuer||null, sort_order||0]
    );
    return successResponse(res, rows[0], 'Achievement created', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create achievement', 500);
  }
};

export const update = async (req, res) => {
  const { title, description, icon, color, date, issuer, sort_order, is_active } = req.body;
  try {
    const [check] = await pool.query('SELECT id FROM achievements WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Achievement not found', 404);
    const [rows] = await pool.query(
      'UPDATE achievements SET title=$1, description=$2, icon=$3, color=$4, date=$5, issuer=$6, sort_order=$7, is_active=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [title, description, icon, color, date, issuer, sort_order??0, is_active??true, req.params.id]
    );
    return successResponse(res, rows[0], 'Achievement updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update achievement', 500);
  }
};

export const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM achievements WHERE id = $1', [req.params.id]);
    return successResponse(res, null, 'Achievement deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete achievement', 500);
  }
};
