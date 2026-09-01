import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parseCert = (c) => ({ ...c, skills: Array.isArray(c.skills) ? c.skills : [] });

export const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM certificates WHERE is_active = TRUE ORDER BY sort_order, issue_date DESC');
    return successResponse(res, rows.map(parseCert));
  } catch (err) {
    return errorResponse(res, 'Failed to fetch certificates', 500);
  }
};

export const getById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM certificates WHERE id = $1', [req.params.id]);
    if (!rows.length) return errorResponse(res, 'Certificate not found', 404);
    return successResponse(res, parseCert(rows[0]));
  } catch (err) {
    return errorResponse(res, 'Failed to fetch certificate', 500);
  }
};

export const create = async (req, res) => {
  const { name, organization, issue_date, expiry_date, credential_id, credential_url, description, skills, sort_order } = req.body;
  const image = req.file ? `/uploads/certificates/${req.file.filename}` : null;
  try {
    const skillsJson = JSON.stringify(typeof skills === 'string' ? JSON.parse(skills || '[]') : (skills || []));
    const [rows] = await pool.query(
      `INSERT INTO certificates (name, organization, issue_date, expiry_date, credential_id, credential_url, image, description, skills, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10) RETURNING *`,
      [name, organization, issue_date, expiry_date||null, credential_id||null, credential_url||null, image, description||null, skillsJson, sort_order||0]
    );
    return successResponse(res, parseCert(rows[0]), 'Certificate created', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create certificate', 500);
  }
};

export const update = async (req, res) => {
  const { name, organization, issue_date, expiry_date, credential_id, credential_url, description, skills, sort_order, is_active } = req.body;
  try {
    const [check] = await pool.query('SELECT * FROM certificates WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Certificate not found', 404);
    const p = check[0];
    const image = req.file ? `/uploads/certificates/${req.file.filename}` : p.image;
    const skillsJson = JSON.stringify(typeof skills === 'string' ? JSON.parse(skills || '[]') : (skills || p.skills || []));
    const [rows] = await pool.query(
      `UPDATE certificates SET name=$1, organization=$2, issue_date=$3, expiry_date=$4, credential_id=$5,
       credential_url=$6, image=$7, description=$8, skills=$9::jsonb, sort_order=$10, is_active=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [name||p.name, organization||p.organization, issue_date||p.issue_date, expiry_date||null, credential_id||null,
       credential_url||null, image, description||null, skillsJson, sort_order??p.sort_order, is_active??p.is_active, req.params.id]
    );
    return successResponse(res, parseCert(rows[0]), 'Certificate updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update certificate', 500);
  }
};

export const remove = async (req, res) => {
  try {
    const [check] = await pool.query('SELECT image FROM certificates WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Certificate not found', 404);
    if (check[0].image) {
      const imgPath = path.join(__dirname, '../../', check[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await pool.query('DELETE FROM certificates WHERE id = $1', [req.params.id]);
    return successResponse(res, null, 'Certificate deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete certificate', 500);
  }
};
