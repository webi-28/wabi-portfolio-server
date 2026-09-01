import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

const parseExp = (e) => ({
  ...e,
  responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : [],
  technologies:     Array.isArray(e.technologies)     ? e.technologies     : [],
});

export const getAll = async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM experience WHERE is_active = TRUE';
    const params = [];
    if (type) { sql += ` AND type = $1`; params.push(type); }
    sql += ' ORDER BY sort_order, start_date DESC';
    const [rows] = await pool.query(sql, params);
    return successResponse(res, rows.map(parseExp));
  } catch (err) {
    return errorResponse(res, 'Failed to fetch experience', 500);
  }
};

export const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM experience WHERE id = $1', [req.params.id]);
    if (!rows.length) return errorResponse(res, 'Experience not found', 404);
    return successResponse(res, parseExp(rows[0]));
  } catch (err) {
    return errorResponse(res, 'Failed to fetch experience', 500);
  }
};

export const create = async (req, res) => {
  const { title, organization, type, location, start_date, end_date, is_current, description, responsibilities, technologies, sort_order } = req.body;
  const respJson = JSON.stringify(Array.isArray(responsibilities) ? responsibilities : (responsibilities ? JSON.parse(responsibilities) : []));
  const techJson = JSON.stringify(Array.isArray(technologies) ? technologies : (technologies ? JSON.parse(technologies) : []));
  try {
    const [rows] = await pool.query(
      `INSERT INTO experience (title, organization, type, location, start_date, end_date, is_current, description, responsibilities, technologies, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11) RETURNING *`,
      [title, organization, type||'academic', location||null, start_date, end_date||null, is_current?true:false, description, respJson, techJson, sort_order||0]
    );
    return successResponse(res, parseExp(rows[0]), 'Experience created', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create experience', 500);
  }
};

export const update = async (req, res) => {
  const { title, organization, type, location, start_date, end_date, is_current, description, responsibilities, technologies, sort_order, is_active } = req.body;
  try {
    const [check] = await pool.query('SELECT * FROM experience WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Experience not found', 404);
    const p = check[0];
    const respJson = JSON.stringify(responsibilities || p.responsibilities || []);
    const techJson = JSON.stringify(technologies || p.technologies || []);
    const [rows] = await pool.query(
      `UPDATE experience SET title=$1, organization=$2, type=$3, location=$4, start_date=$5, end_date=$6,
       is_current=$7, description=$8, responsibilities=$9::jsonb, technologies=$10::jsonb, sort_order=$11, is_active=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [title||p.title, organization||p.organization, type||p.type, location??p.location,
       start_date||p.start_date, end_date??p.end_date, is_current??p.is_current,
       description||p.description, respJson, techJson, sort_order??p.sort_order, is_active??p.is_active, req.params.id]
    );
    return successResponse(res, parseExp(rows[0]), 'Experience updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update experience', 500);
  }
};

export const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM experience WHERE id = $1', [req.params.id]);
    return successResponse(res, null, 'Experience deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete experience', 500);
  }
};
