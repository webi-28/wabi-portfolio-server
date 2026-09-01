-- ============================================================
-- Wabi Worku Portfolio - PostgreSQL Schema
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        VARCHAR(20)   NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','super_admin')),
  avatar      VARCHAR(255),
  last_login  TIMESTAMP,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── SETTINGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id          SERIAL PRIMARY KEY,
  key         VARCHAR(100)  NOT NULL UNIQUE,
  value       TEXT,
  type        VARCHAR(20)   NOT NULL DEFAULT 'text' CHECK (type IN ('text','json','boolean','number')),
  description VARCHAR(255),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- ── SKILLS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  category    VARCHAR(30)   NOT NULL CHECK (category IN ('frontend','backend','programming','database','tools','devops','api','other')),
  proficiency INT           NOT NULL DEFAULT 80 CHECK (proficiency BETWEEN 0 AND 100),
  icon        VARCHAR(100),
  color       VARCHAR(20)   DEFAULT '#2563EB',
  sort_order  INT           NOT NULL DEFAULT 0,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- ── PROJECTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                SERIAL PRIMARY KEY,
  title             VARCHAR(200)  NOT NULL,
  slug              VARCHAR(200)  NOT NULL UNIQUE,
  short_description VARCHAR(500)  NOT NULL,
  description       TEXT          NOT NULL,
  technologies      JSONB         NOT NULL DEFAULT '[]',
  category          VARCHAR(30)   NOT NULL DEFAULT 'web' CHECK (category IN ('web','mobile','desktop','api','database','other')),
  image             VARCHAR(255),
  screenshots       JSONB         DEFAULT '[]',
  github_url        VARCHAR(500),
  live_url          VARCHAR(500),
  status            VARCHAR(20)   NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','in_progress','planned')),
  is_featured       BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order        INT           NOT NULL DEFAULT 0,
  project_date      DATE,
  created_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_slug     ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);

-- ── CERTIFICATES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(200)  NOT NULL,
  organization   VARCHAR(200)  NOT NULL,
  issue_date     DATE          NOT NULL,
  expiry_date    DATE,
  credential_id  VARCHAR(200),
  credential_url VARCHAR(500),
  image          VARCHAR(255),
  description    TEXT,
  skills         JSONB         DEFAULT '[]',
  is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order     INT           NOT NULL DEFAULT 0,
  created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── EDUCATION ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education (
  id             SERIAL PRIMARY KEY,
  institution    VARCHAR(200)  NOT NULL,
  degree         VARCHAR(200)  NOT NULL,
  field_of_study VARCHAR(200)  NOT NULL DEFAULT '',
  gpa            NUMERIC(4,2),
  max_gpa        NUMERIC(4,2)  DEFAULT 4.00,
  start_date     DATE          NOT NULL,
  end_date       DATE,
  is_current     BOOLEAN       NOT NULL DEFAULT FALSE,
  location       VARCHAR(200),
  description    TEXT,
  achievements   JSONB         DEFAULT '[]',
  logo           VARCHAR(255),
  sort_order     INT           NOT NULL DEFAULT 0,
  created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── EXPERIENCE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experience (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  organization     VARCHAR(200)  NOT NULL,
  type             VARCHAR(30)   NOT NULL DEFAULT 'academic' CHECK (type IN ('academic','volunteer','internship','part_time','full_time','freelance')),
  location         VARCHAR(200),
  start_date       DATE          NOT NULL,
  end_date         DATE,
  is_current       BOOLEAN       NOT NULL DEFAULT FALSE,
  description      TEXT          NOT NULL,
  responsibilities JSONB         DEFAULT '[]',
  technologies     JSONB         DEFAULT '[]',
  logo             VARCHAR(255),
  sort_order       INT           NOT NULL DEFAULT 0,
  is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── ACHIEVEMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200)  NOT NULL,
  description TEXT         NOT NULL,
  icon       VARCHAR(100),
  color      VARCHAR(20)   DEFAULT '#2563EB',
  date       DATE,
  issuer     VARCHAR(200),
  sort_order INT           NOT NULL DEFAULT 0,
  is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── LANGUAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS languages (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  level       VARCHAR(20)   NOT NULL DEFAULT 'Fluent' CHECK (level IN ('Native','Fluent','Conversational','Basic')),
  proficiency INT           NOT NULL DEFAULT 80 CHECK (proficiency BETWEEN 0 AND 100),
  flag        VARCHAR(10)   DEFAULT '🌍',
  color       VARCHAR(20)   DEFAULT '#2563EB',
  sort_order  INT           NOT NULL DEFAULT 0,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL,
  subject    VARCHAR(300)  NOT NULL,
  message    TEXT          NOT NULL,
  status     VARCHAR(20)   NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','replied','archived')),
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  replied_at TIMESTAMP,
  created_at TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP     NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_status  ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: Admin@2024)
INSERT INTO users (name, email, password, role) VALUES
  ('Webi Worku Alemu', 'wworku28@gmail.com',
   '$2a$12$9yRK7gbBqxmcSd4fKWZSWuMhCgfXOgri4Hk81thI4wXjCDhD9zhjm',
   'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Settings
INSERT INTO settings (key, value, type, description) VALUES
  ('hero_name',        'Webi Worku Alemu',                  'text', 'Full name in hero'),
  ('hero_roles',       'Information Technology Graduate,Full-Stack Developer,Network Administrator,Software Engineer', 'text', 'Typing roles'),
  ('hero_bio',         'Motivated IT graduate from Haramaya University with a CGPA of 3.55/4.00. Skilled in web development, networking, database management, and IT support.', 'text', 'Hero bio'),
  ('about_summary',    'Recent Information Technology graduate with a CGPA of 3.55/4.00. Skilled in web development, networking, database management, and IT support. Strong problem-solving and teamwork abilities with a passion for technology and continuous learning.', 'text', 'About summary'),
  ('about_objective',  'Seeking an opportunity to contribute technical skills and grow professionally in the IT industry.', 'text', 'Career objective'),
  ('owner_name',       'Webi Worku Alemu',                  'text', 'Owner name'),
  ('owner_email',      'wworku28@gmail.com',                'text', 'Contact email'),
  ('owner_phone',      '0952879685',                        'text', 'Phone'),
  ('owner_location',   'Addis Ababa, Ethiopia',             'text', 'Location'),
  ('owner_degree',     'BSc in Information Technology',     'text', 'Degree'),
  ('owner_university', 'Haramaya University',               'text', 'University'),
  ('owner_graduation', 'June 2026',                         'text', 'Graduation date'),
  ('owner_cgpa',       '3.55/4.00',                        'text', 'CGPA'),
  ('owner_languages',  'Afaan Oromo, Amharic, English',    'text', 'Languages'),
  ('github_url',       'https://github.com/webi-28',        'text', 'GitHub URL'),
  ('linkedin_url',     'https://www.linkedin.com/in/webi-worku-a8737a352/', 'text', 'LinkedIn URL'),
  ('cv_url',           '/uploads/cv/wabi-worku-cv.pdf',     'text', 'CV URL'),
  ('profile_image',    '/assets/EVER7706.JPG',              'text', 'Profile photo'),
  ('available_for_work','true',                             'boolean', 'Available badge'),
  ('site_title',       'Webi Worku | IT Graduate & Full-Stack Developer', 'text', 'Site title')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Education
INSERT INTO education (institution, degree, field_of_study, gpa, max_gpa, start_date, end_date, is_current, location, description, achievements, sort_order)
VALUES (
  'Haramaya University', 'Bachelor of Science', 'Information Technology',
  3.55, 4.00, '2020-09-01', '2026-06-30', FALSE,
  'Haramaya, Ethiopia',
  'Completed a four-year BSc program in Information Technology. Maintained a strong academic record with a CGPA of 3.55/4.00. Successfully passed the Ethiopian National Exit Examination with a score of 64/100.',
  '["Grade A – Final Year Project","CGPA 3.55/4.00","National Exit Exam: 64/100"]',
  1
) ON CONFLICT DO NOTHING;

-- Skills
INSERT INTO skills (name, category, proficiency, icon, color, sort_order) VALUES
  ('HTML5','frontend',92,'FaHtml5','#E34F26',1),
  ('CSS3','frontend',88,'FaCss3Alt','#1572B6',2),
  ('JavaScript','frontend',85,'SiJavascript','#F7DF1E',3),
  ('React.js','frontend',82,'FaReact','#61DAFB',4),
  ('Bootstrap','frontend',80,'SiBootstrap','#7952B3',5),
  ('Tailwind CSS','frontend',80,'SiTailwindcss','#06B6D4',6),
  ('Node.js','backend',78,'FaNodeJs','#339933',1),
  ('Express.js','backend',78,'SiExpress','#68A063',2),
  ('PHP','backend',72,'SiPhp','#777BB4',3),
  ('Laravel','backend',68,'SiLaravel','#FF2D20',4),
  ('Java','programming',75,'FaJava','#007396',1),
  ('Python','programming',78,'FaPython','#3776AB',2),
  ('C++','programming',70,'SiCplusplus','#00599C',3),
  ('C#','programming',68,'SiDotnet','#239120',4),
  ('MySQL','database',82,'SiMysql','#4479A1',1),
  ('PostgreSQL','database',75,'SiPostgresql','#336791',2),
  ('MongoDB','database',68,'SiMongodb','#47A248',3),
  ('SQLite','database',75,'SiSqlite','#003B57',4),
  ('Git','tools',85,'FaGit','#F05032',1),
  ('GitHub','tools',85,'FaGithub','#9CA3AF',2),
  ('VS Code','tools',92,'FaCode','#007ACC',3),
  ('XAMPP','tools',80,'SiXampp','#FB7A24',4),
  ('VMware','tools',65,'SiVmware','#607078',5),
  ('RESTful API Development','api',82,'FaServer','#2563EB',1),
  ('API Design & Documentation','api',78,'FaCode','#06B6D4',2),
  ('CRUD API Development','api',85,'FaDatabase','#8B5CF6',3),
  ('JSON Data Exchange','api',88,'FaCode','#10B981',4),
  ('API Testing (Postman)','api',80,'SiPostman','#FF6C37',5),
  ('JWT Authentication','api',78,'FaLock','#EF4444',6),
  ('HTTP Methods','api',90,'FaExchangeAlt','#3B82F6',7),
  ('Error Handling & Validation','api',82,'FaShieldAlt','#06B6D4',8),
  ('API Integration','api',78,'FaPlug','#A855F7',9)
ON CONFLICT DO NOTHING;

-- Projects
INSERT INTO projects (title, slug, short_description, description, technologies, category, github_url, status, is_featured, sort_order, project_date) VALUES
(
  'Cafeteria Management System','cafeteria-management-system',
  'Full-stack web application for managing cafeteria operations including menu, orders, billing, and reporting.',
  'A comprehensive cafeteria management system built to streamline daily operations. Features user authentication, role-based access control, inventory tracking, and financial reporting dashboards.',
  '["PHP","MySQL","Bootstrap","JavaScript","HTML5","CSS3","XAMPP"]','web',
  'https://github.com/webi-28/cafeteria-management','completed',TRUE,1,'2023-06-01'
),
(
  'Online Vacancy & Recruitment System','online-vacancy-recruitment-system',
  'Web-based recruitment platform connecting employers with job seekers through automated application management.',
  'A full-featured online recruitment platform developed as a final-year academic project. Includes email notifications, applicant tracking, and admin dashboard.',
  '["PHP","Laravel","MySQL","Bootstrap","JavaScript"]','web',
  'https://github.com/webi-28/recruitment-system','completed',TRUE,2,'2023-12-01'
),
(
  'Hospital Management System','hospital-management-system',
  'Desktop application for managing patient records, appointments, prescriptions, and hospital operations.',
  'A robust hospital management system to digitize hospital operations. Handles patient registration, appointment scheduling, prescription records, billing, and inventory.',
  '["Java","MySQL","JavaFX","JDBC"]','desktop',
  'https://github.com/webi-28/hospital-management','completed',TRUE,3,'2023-03-01'
),
(
  'Harar Tourism Website','harar-tourism-website',
  'Cultural tourism website showcasing the historical sites and attractions of Harar, Ethiopia.',
  'A visually appealing tourism website promoting Harar, a UNESCO World Heritage Site. Features gallery, multilingual support, and tour booking contact forms.',
  '["HTML5","CSS3","JavaScript","Bootstrap","PHP","MySQL"]','web',
  'https://github.com/webi-28/harar-tourism','completed',TRUE,4,'2022-09-01'
)
ON CONFLICT (slug) DO NOTHING;

-- Certificates
INSERT INTO certificates (name, organization, issue_date, description, sort_order) VALUES
  ('Ministry of Peace Volunteer Certificate','Ministry of Peace, Ethiopia','2024-01-01','Recognized for active participation in national volunteer and community service initiatives.',1),
  ('Claude AI Fluency Certificate','Anthropic','2024-01-10','Certificate demonstrating proficiency in working with Claude AI and AI-assisted development.',2),
  ('Claude 101 Certificate','Anthropic','2024-01-05','Foundational certificate covering basics of AI interaction and practical applications of LLMs.',3)
ON CONFLICT DO NOTHING;

-- Experience
INSERT INTO experience (title, organization, type, location, start_date, end_date, is_current, description, responsibilities, technologies, sort_order) VALUES
(
  'Final Year Academic Project Lead',
  'Haramaya University – IT Department','academic','Haramaya, Ethiopia',
  '2023-09-01','2024-06-30',FALSE,
  'Led the design and development of the Online Vacancy and Recruitment System as the capstone project.',
  '["Designed system architecture and database schema","Led a team of 4 developers","Implemented backend API using Laravel","Received Grade A from faculty panel"]',
  '["PHP","Laravel","MySQL","Bootstrap"]',1
),
(
  'Community Peace Volunteer',
  'Ministry of Peace, Ethiopia','volunteer','Haramaya, Ethiopia',
  '2023-06-01','2023-08-31',FALSE,
  'Participated in community outreach programs promoting peace, dialogue, and social harmony.',
  '["Organized community dialogue sessions","Created awareness materials","Engaged with 200+ community members"]',
  '[]',2
),
(
  'Self-Directed Software Development',
  'Personal Projects','academic','Remote',
  '2021-06-01','2026-06-30',FALSE,
  'Independently developed multiple software projects applying classroom knowledge to real-world applications.',
  '["Built 4+ complete software applications","Practiced full-stack web development","Documented all projects on GitHub"]',
  '["HTML5","CSS3","JavaScript","PHP","Java","MySQL"]',3
) ON CONFLICT DO NOTHING;

-- Achievements
INSERT INTO achievements (title, description, icon, color, date, issuer, sort_order) VALUES
  ('Grade A – Final Year Project','Achieved the highest grade for the Online Vacancy and Recruitment System capstone project.','FaTrophy','#F59E0B','2024-06-01','Haramaya University',1),
  ('CGPA 3.55/4.00','Maintained a strong academic record throughout the four-year BSc program in IT.','FaGraduationCap','#2563EB','2024-06-01','Haramaya University',2),
  ('4 Major Academic Projects','Designed and delivered four comprehensive software systems during academic tenure.','FaCode','#10B981','2024-06-01','Personal Achievement',3),
  ('National Exit Exam: 64/100','Successfully passed the Ethiopian National Exit Examination with a score of 64/100.','FaStar','#06B6D4','2024-06-01','Ethiopian Ministry of Education',4),
  ('Volunteer Recognition','Recognized for outstanding community peace-building contributions.','FaHeart','#EF4444','2023-08-15','Ministry of Peace, Ethiopia',5),
  ('AI Fluency Certifications','Earned two Claude AI certifications from Anthropic — staying current with emerging tech.','FaBrain','#8B5CF6','2024-01-10','Anthropic',6)
ON CONFLICT DO NOTHING;

-- Languages
INSERT INTO languages (name, level, proficiency, flag, color, sort_order) VALUES
  ('Afaan Oromo','Native',100,'🇪🇹','#10B981',1),
  ('Amharic','Fluent',90,'🇪🇹','#3B82F6',2),
  ('English','Fluent',85,'🌍','#06B6D4',3)
ON CONFLICT DO NOTHING;
