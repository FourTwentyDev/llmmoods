-- Alternative Schema mit Partitionierung (ohne Foreign Keys)
-- Nutze dieses Schema für bessere Performance bei großen Datenmengen

CREATE DATABASE IF NOT EXISTS llmmood;
USE llmmood;

-- Models table (gleich wie Original)
CREATE TABLE IF NOT EXISTS models (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    category ENUM('llm', 'image', 'code', 'audio', 'video') DEFAULT 'llm',
    context_length INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_provider (provider),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Votes table MIT Partitionierung (ohne Foreign Key)
-- Nutze Application-Level Integrity Checks
CREATE TABLE IF NOT EXISTS votes_partitioned (
    id BIGINT AUTO_INCREMENT,
    model_id VARCHAR(100) NOT NULL,
    vote_date DATE NOT NULL,
    fingerprint_hash VARCHAR(64) NOT NULL,
    performance TINYINT CHECK (performance BETWEEN 1 AND 4),
    speed TINYINT CHECK (speed BETWEEN 1 AND 5),
    intelligence TINYINT CHECK (intelligence BETWEEN 1 AND 5),
    reliability TINYINT CHECK (reliability BETWEEN 1 AND 4),
    issue_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, vote_date),
    INDEX idx_model_date (model_id, vote_date),
    INDEX idx_fingerprint_date (fingerprint_hash, vote_date),
    UNIQUE KEY unique_vote (model_id, fingerprint_hash, vote_date)
) ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(vote_date)) (
    PARTITION p_2025_01 VALUES LESS THAN (TO_DAYS('2025-02-01')),
    PARTITION p_2025_02 VALUES LESS THAN (TO_DAYS('2025-03-01')),
    PARTITION p_2025_03 VALUES LESS THAN (TO_DAYS('2025-04-01')),
    PARTITION p_2025_04 VALUES LESS THAN (TO_DAYS('2025-05-01')),
    PARTITION p_2025_05 VALUES LESS THAN (TO_DAYS('2025-06-01')),
    PARTITION p_2025_06 VALUES LESS THAN (TO_DAYS('2025-07-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Trigger für Application-Level Foreign Key Check
DELIMITER //
CREATE TRIGGER check_model_exists 
BEFORE INSERT ON votes_partitioned
FOR EACH ROW
BEGIN
    DECLARE model_count INT;
    SELECT COUNT(*) INTO model_count FROM models WHERE id = NEW.model_id;
    IF model_count = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Model ID does not exist';
    END IF;
END//
DELIMITER ;