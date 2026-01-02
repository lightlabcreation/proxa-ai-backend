-- Add userId column to service_sow_consolidations table
ALTER TABLE service_sow_consolidations ADD COLUMN userId BIGINT NULL;

-- Add index for better query performance
CREATE INDEX idx_sow_consolidation_userId ON service_sow_consolidations(userId);
