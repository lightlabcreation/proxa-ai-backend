-- Migration script to add expiry_date and is_active fields to licenses table
-- Run this SQL script to update the existing licenses table

-- Add expiry_date column (nullable)
ALTER TABLE `licenses` 
ADD COLUMN IF NOT EXISTS `expiry_date` DATETIME NULL AFTER `status`;

-- Add is_active column (boolean, default true)
ALTER TABLE `licenses` 
ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN NOT NULL DEFAULT TRUE AFTER `status`;

-- Add updated_at column
ALTER TABLE `licenses` 
ADD COLUMN IF NOT EXISTS `updated_at` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Update existing active licenses to have is_active = true
UPDATE `licenses` SET `is_active` = TRUE WHERE `status` = 'active';

-- Update existing unused/revoked licenses to have is_active = false
UPDATE `licenses` SET `is_active` = FALSE WHERE `status` IN ('unused', 'revoked');

-- Add index for expiry_date for faster queries
ALTER TABLE `licenses` 
ADD INDEX IF NOT EXISTS `idx_expiry_date` (`expiry_date`);

-- Add index for is_active
ALTER TABLE `licenses` 
ADD INDEX IF NOT EXISTS `idx_is_active` (`is_active`);

