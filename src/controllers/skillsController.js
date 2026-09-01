import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const getAll = async (req, res) => {
  try {
    const { category, active = 'true' } = req.query;
    let sql = 'SELECT * FROM skills WHERE is_active = $1';
    const params = [active === 'true'];
    if (category) { sql += ` AND category = $${params.length + 1}`; params.push(category); }
    sql += ' ORDER BY category, sort_order, name';
    const [rows] = await pool.query(sql, params);
    const grouped = rows.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});
    return successResponse(res, { skills: rows, grouped });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch skills', 500);
  }
};

export const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM skills WHERE id = $1', [req.params.id]);
    if (!rows.length) return errorResponse(res, 'Skill not found', 404);
    return successResponse(res, rows[0]);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch skill', 500);
  }
};

export const create = async (req, res) => {
  const { name, category, proficiency, icon, color, sort_order } = req.body;
  try {
    const [rows] = await pool.query(
      'INSERT INTO skills (name, category, proficiency, icon, color, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, category, proficiency || 80, icon || null, color || '#2563EB', sort_order || 0]
    );
    return successResponse(res, rows[0], 'Skill created', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create skill', 500);
  }
};

export const update = async (req, res) => {
  const { name, category, proficiency, icon, color, sort_order, is_active } = req.body;
  try {
    const [check] = await pool.query('SELECT id FROM skills WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Skill not found', 404);
    const [rows] = await pool.query(
      'UPDATE skills SET name=$1, category=$2, proficiency=$3, icon=$4, color=$5, sort_order=$6, is_active=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, category, proficiency, icon, color, sort_order, is_active ?? true, req.params.id]
    );
    return successResponse(res, rows[0], 'Skill updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update skill', 500);
  }
};

export const remove = async (req, res) => {
  try {
    const [check] = await pool.query('SELECT id FROM skills WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Skill not found', 404);
    await pool.query('DELETE FROM skills WHERE id = $1', [req.params.id]);
    return successResponse(res, null, 'Skill deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete skill', 500);
  }
};
