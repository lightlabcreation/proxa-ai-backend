-- Migration script to create licenses table
-- Run this SQL script in your MySQL database to create the licenses table

CREATE TABLE IF NOT EXISTS `licenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `license_key` VARCHAR(255) NOT NULL UNIQUE,
  `assigned_email` VARCHAR(255) NULL,
  `status` ENUM('unused', 'active', 'revoked') NOT NULL DEFAULT 'unused',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_license_key` (`license_key`),
  INDEX `idx_assigned_email` (`assigned_email`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

