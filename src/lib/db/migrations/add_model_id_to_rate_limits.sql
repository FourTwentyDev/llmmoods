-- Add model_id to rate_limits table to enable per-model rate limiting
ALTER TABLE rate_limits DROP PRIMARY KEY;

ALTER TABLE rate_limits 
ADD COLUMN model_id VARCHAR(255) DEFAULT NULL AFTER fingerprint_hash,
ADD INDEX idx_fingerprint_model (fingerprint_hash, model_id),
ADD PRIMARY KEY (fingerprint_hash, action_type, model_id);

-- Update existing records to have NULL model_id (for backwards compatibility)
UPDATE rate_limits SET model_id = NULL WHERE model_id IS NULL;

-- Drop and recreate the cleanup stored procedure
DROP PROCEDURE IF EXISTS cleanup_rate_limits;

DELIMITER //
CREATE PROCEDURE cleanup_rate_limits()
BEGIN
    DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL 25 HOUR);
END//
DELIMITER ;