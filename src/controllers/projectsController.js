import pool from '../config/db.js';
import { successResponse, errorResponse, paginate, paginationMeta, slugify } from '../utils/helpers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parseProject = (p) => ({
  ...p,
  technologies: Array.isArray(p.technologies) ? p.technologies : (typeof p.technologies === 'string' ? JSON.parse(p.technologies || '[]') : []),
  screenshots:  Array.isArray(p.screenshots)  ? p.screenshots  : (typeof p.screenshots  === 'string' ? JSON.parse(p.screenshots  || '[]') : []),
});

export const getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit || 9);
    const { category, search, featured, sort = 'sort_order' } = req.query;

    const params = [];
    const countParams = [];
    let where = 'WHERE is_active = TRUE';
    let countWhere = 'WHERE is_active = TRUE';

    if (category) {
      params.push(category); countParams.push(category);
      where      += ` AND category = $${params.length}`;
      countWhere += ` AND category = $${countParams.length}`;
    }
    if (featured === '1') {
      where      += ' AND is_featured = TRUE';
      countWhere += ' AND is_featured = TRUE';
    }
    if (search) {
      const q = `%${search}%`;
      params.push(q, q); countParams.push(q, q);
      where      += ` AND (title ILIKE $${params.length - 1} OR short_description ILIKE $${params.length})`;
      countWhere += ` AND (title ILIKE $${countParams.length - 1} OR short_description ILIKE $${countParams.length})`;
    }

    const sortMap = { sort_order: 'sort_order', date: 'project_date DESC', title: 'title' };
    const orderBy = sortMap[sort] || 'sort_order';

    params.push(limit, offset);
    const sql = `SELECT * FROM projects ${where} ORDER BY ${orderBy}, created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const [[{ count: total }], [rows]] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM projects ${countWhere}`, countParams),
      pool.query(sql, params),
    ]);

    return successResponse(res, {
      projects: rows.map(parseProject),
      pagination: paginationMeta(parseInt(total), page, limit),
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Failed to fetch projects', 500);
  }
};

export const getBySlug = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE (slug = $1 OR id::text = $1) AND is_active = TRUE',
      [req.params.slug]
    );
    if (!rows.length) return errorResponse(res, 'Project not found', 404);
    return successResponse(res, parseProject(rows[0]));
  } catch (err) {
    return errorResponse(res, 'Failed to fetch project', 500);
  }
};

export const create = async (req, res) => {
  const { title, short_description, description, technologies, category, github_url, live_url, status, is_featured, sort_order, project_date } = req.body;
  const image = req.file ? `/uploads/projects/${req.file.filename}` : null;
  try {
    const slug = slugify(title);
    const techs = typeof technologies === 'string' ? technologies : JSON.stringify(technologies || []);
    const [rows] = await pool.query(
      `INSERT INTO projects (title, slug, short_description, description, technologies, category, image, github_url, live_url, status, is_featured, sort_order, project_date)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [title, slug, short_description, description, techs, category || 'web', image, github_url || null, live_url || null, status || 'completed', is_featured ? true : false, sort_order || 0, project_date || null]
    );
    return successResponse(res, parseProject(rows[0]), 'Project created', 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Failed to create project', 500);
  }
};

export const update = async (req, res) => {
  const { title, short_description, description, technologies, category, github_url, live_url, status, is_featured, is_active, sort_order, project_date } = req.body;
  try {
    const [check] = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Project not found', 404);
    const p = check[0];
    const image = req.file ? `/uploads/projects/${req.file.filename}` : p.image;
    const slug  = title ? slugify(title) : p.slug;
    const techs = technologies ? (typeof technologies === 'string' ? technologies : JSON.stringify(technologies)) : JSON.stringify(p.technologies || []);
    const [rows] = await pool.query(
      `UPDATE projects SET title=$1, slug=$2, short_description=$3, description=$4, technologies=$5::jsonb,
       category=$6, image=$7, github_url=$8, live_url=$9, status=$10, is_featured=$11, is_active=$12,
       sort_order=$13, project_date=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [title||p.title, slug, short_description||p.short_description, description||p.description, techs,
       category||p.category, image, github_url!==undefined?github_url:p.github_url,
       live_url!==undefined?live_url:p.live_url, status||p.status,
       is_featured!==undefined?is_featured:p.is_featured,
       is_active!==undefined?is_active:p.is_active,
       sort_order!==undefined?sort_order:p.sort_order,
       project_date||p.project_date, req.params.id]
    );
    return successResponse(res, parseProject(rows[0]), 'Project updated');
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Failed to update project', 500);
  }
};

export const remove = async (req, res) => {
  try {
    const [check] = await pool.query('SELECT image FROM projects WHERE id = $1', [req.params.id]);
    if (!check.length) return errorResponse(res, 'Project not found', 404);
    if (check[0].image) {
      const imgPath = path.join(__dirname, '../../', check[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    return successResponse(res, null, 'Project deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete project', 500);
  }
};
