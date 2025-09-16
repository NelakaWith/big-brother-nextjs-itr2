-- Schema for Big Brother monitoring dashboard
CREATE DATABASE IF NOT EXISTS big_brother CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE big_brother;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS apps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type ENUM('backend','frontend') NOT NULL DEFAULT 'backend',
  pm2_name VARCHAR(200),
  nginx_server_name VARCHAR(255),
  port INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  app_id BIGINT UNSIGNED NOT NULL,
  log_type ENUM('backend','frontend') NOT NULL,
  log_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);

-- Note: seed admin user via seed script to ensure password hashing
