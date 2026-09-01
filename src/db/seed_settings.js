import 'dotenv/config';
import pool from '../config/db.js';

const settings = [
  ['hero_name', 'Wabi Worku', 'text', 'Full name in hero section'],
  ['hero_roles', 'Information Technology Graduate,Full-Stack Developer,React Developer,Software Engineer', 'text', 'Typing roles (comma-separated)'],
  ['hero_bio', 'Motivated IT graduate from Haramaya University with strong skills in software development, web technologies, databases, and problem-solving. Passionate about building elegant digital solutions that make a real impact.', 'text', 'Hero bio paragraph'],
  ['about_summary', 'Motivated Information Technology graduate with strong skills in software development, web technologies, databases, networking, and problem-solving. Experienced in building full-stack web applications, desktop software, and database systems through academic projects and self-directed learning.', 'text', 'Professional summary'],
  ['about_objective', 'Seeking a challenging role in a forward-thinking organization where I can apply my technical skills and passion for innovation to contribute meaningfully while continuing to grow as a professional software developer and IT specialist.', 'text', 'Career objective'],
  ['owner_name', 'Wabi Worku', 'text', 'Owner full name'],
  ['owner_email', 'wworku28@gmail.com', 'text', 'Contact email'],
  ['owner_phone', '+251 912 345 678', 'text', 'Phone number'],
  ['owner_location', 'Addis Ababa, Ethiopia', 'text', 'Location'],
  ['owner_degree', 'Bachelor of Science in Information Technology', 'text', 'Degree'],
  ['owner_university', 'Haramaya University', 'text', 'University'],
  ['owner_graduation', 'June 2026', 'text', 'Graduation date'],
  ['owner_cgpa', '3.55/4.00', 'text', 'CGPA'],
  ['owner_languages', 'Afaan Oromo, Amharic, English', 'text', 'Spoken languages'],
  ['github_url', 'https://github.com/wabiworku', 'text', 'GitHub profile URL'],
  ['linkedin_url', 'https://linkedin.com/in/wabiworku', 'text', 'LinkedIn profile URL'],
  ['cv_url', '/downloads/wabi-worku-cv.pdf', 'text', 'CV download link'],
  ['profile_image', '/assets/EVER7706.JPG', 'text', 'Profile photo path'],
  ['available_for_work', 'true', 'boolean', 'Show available badge'],
  ['site_title', 'Wabi Worku | IT Graduate & Full-Stack Developer', 'text', 'Browser tab title'],
];

for (const [key, value, type, description] of settings) {
  await pool.query(
    'INSERT INTO settings (`key`, `value`, `type`, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), description=VALUES(description)',
    [key, value, type, description]
  );
}

console.log(`✅ Seeded ${settings.length} settings`);

// Also add languages table if not exists
await pool.query(`
  CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level ENUM('Native','Fluent','Conversational','Basic') DEFAULT 'Fluent',
    proficiency INT DEFAULT 80,
    flag VARCHAR(10) DEFAULT '🌍',
    color VARCHAR(20) DEFAULT '#2563EB',
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB
`);

await pool.query(`
  INSERT INTO languages (name, level, proficiency, flag, color, sort_order) VALUES
  ('Afaan Oromo', 'Native', 100, '🇪🇹', '#10B981', 1),
  ('Amharic', 'Fluent', 90, '🇪🇹', '#2563EB', 2),
  ('English', 'Fluent', 85, '🌍', '#06B6D4', 3)
  ON DUPLICATE KEY UPDATE id=id
`);

console.log('✅ Languages table ready');
process.exit(0);
