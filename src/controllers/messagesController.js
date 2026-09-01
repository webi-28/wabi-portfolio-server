import pool from '../config/db.js';
import { successResponse, errorResponse, paginate, paginationMeta, sanitize } from '../utils/helpers.js';

export const create = async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const [rows] = await pool.query(
      'INSERT INTO messages (name, email, subject, message, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [sanitize(name), sanitize(email), sanitize(subject), sanitize(message), req.ip, req.headers['user-agent']||null]
    );
    return successResponse(res, { id: rows[0].id }, 'Message sent successfully! I will get back to you soon.', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to send message', 500);
  }
};

export const getAll = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit || 20);
    const { status } = req.query;

    let sql = 'SELECT * FROM messages';
    let countSql = 'SELECT COUNT(*) FROM messages';
    const params = [];
    const countParams = [];

    if (status) {
      sql += ' WHERE status = $1';
      countSql += ' WHERE status = $1';
      params.push(status);
      countParams.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
    params.push(limit, offset);

    const [[{ count: total }], [rows]] = await Promise.all([
      pool.query(countSql, countParams),
      pool.query(sql, params),
    ]);

    return successResponse(res, { messages: rows, pagination: paginationMeta(parseInt(total), page, limit) });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch messages', 500);
  }
};

export const updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const extra = status === 'replied' ? ', replied_at = NOW()' : '';
    await pool.query(`UPDATE messages SET status = $1${extra}, updated_at = NOW() WHERE id = $2`, [status, req.params.id]);
    return successResponse(res, null, 'Message status updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update message', 500);
  }
};

export const remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    return successResponse(res, null, 'Message deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete message', 500);
  }
};

export const getStats = async (req, res) => {
  try {
    const [[p], [c], [s], [m], [u]] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM projects WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM certificates WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM skills WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM messages'),
      pool.query("SELECT COUNT(*) FROM messages WHERE status = 'unread'"),
    ]);
    return successResponse(res, {
      projects:       parseInt(p[0].count),
      certificates:   parseInt(c[0].count),
      skills:         parseInt(s[0].count),
      messages:       parseInt(m[0].count),
      unreadMessages: parseInt(u[0].count),
    }, 'Dashboard stats');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch stats', 500);
  }
};
