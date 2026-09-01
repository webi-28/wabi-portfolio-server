import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import skillsRoutes from './routes/skills.js';
import certificatesRoutes from './routes/certificates.js';
import experienceRoutes from './routes/experience.js';
import achievementsRoutes from './routes/achievements.js';
import messagesRoutes from './routes/messages.js';
import languagesRoutes from './routes/languages.js';
import settingsRoutes from './routes/settings.js';
import educationRoutes from './routes/education.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ── Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ── CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://wabiworku.dev',
    'https://www.wabiworku.dev',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests, please try again later.' });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many messages sent. Please wait before trying again.' });
app.use('/api/', limiter);
app.use('/api/messages', contactLimiter);

// ── Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ── Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/education', educationRoutes);

// ── Error handlers
app.use(notFound);
app.use(errorHandler);

// ── Start
app.listen(PORT, async () => {
  await testConnection();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
