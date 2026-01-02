-- Migration script to add SuperAdmin system support
-- Run this SQL script to update the database

-- 1. Add is_active field to users table (if not exists)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN NOT NULL DEFAULT TRUE AFTER `isapprovalFlow`;

-- 2. Update licenses table to link to admin_id
ALTER TABLE `licenses` 
ADD COLUMN IF NOT EXISTS `admin_id` BIGINT NULL AFTER `id`,
ADD INDEX IF NOT EXISTS `idx_admin_id` (`admin_id`);

-- Add foreign key constraint (optional, adjust based on your setup)
-- ALTER TABLE `licenses` 
-- ADD CONSTRAINT `fk_licenses_admin` 
-- FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL COMMENT 'license_expiry, license_expired, renewal_request, renewal_approved',
  `message` TEXT NOT NULL,
  `target_user_id` BIGINT NULL COMMENT 'NULL for SuperAdmin notifications, user_id for Admin notifications',
  `target_role` VARCHAR(20) NOT NULL COMMENT 'superadmin or admin',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `related_license_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_target_user` (`target_user_id`),
  INDEX `idx_target_role` (`target_role`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Update existing licenses to set is_active based on status
UPDATE `licenses` SET `is_active` = TRUE WHERE `status` = 'active';
UPDATE `licenses` SET `is_active` = FALSE WHERE `status` IN ('unused', 'revoked');

-- 5. Set all existing users as active by default
UPDATE `users` SET `is_active` = TRUE WHERE `is_active` IS NULL;

