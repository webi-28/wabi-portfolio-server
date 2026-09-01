import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]
    );
    if (!rows.length) return errorResponse(res, 'Invalid email or password', 401);

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 'Invalid email or password', 401);

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = signToken(user.id, user.role);
    const { password: _, ...userData } = user;
    return successResponse(res, { token, user: userData }, 'Login successful');
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Server error during login', 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, last_login, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return errorResponse(res, 'User not found', 404);
    return successResponse(res, rows[0], 'Profile fetched');
  } catch (err) {
    return errorResponse(res, 'Server error', 500);
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return errorResponse(res, 'User not found', 404);

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) return errorResponse(res, 'Current password is incorrect', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    return successResponse(res, null, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, 'Server error', 500);
  }
};
