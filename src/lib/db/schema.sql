-- LLM Mood Tracker Database Schema
-- GDPR compliant, no PII stored

CREATE DATABASE IF NOT EXISTS llmmood;
USE llmmood;

-- Models table
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
);

-- Votes table (without partitioning due to MySQL limitations with foreign keys)
CREATE TABLE IF NOT EXISTS votes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL,
    vote_date DATE NOT NULL,
    fingerprint_hash VARCHAR(64) NOT NULL,
    performance TINYINT CHECK (performance BETWEEN 1 AND 4),
    speed TINYINT CHECK (speed BETWEEN 1 AND 5),
    intelligence TINYINT CHECK (intelligence BETWEEN 1 AND 5),
    reliability TINYINT CHECK (reliability BETWEEN 1 AND 4),
    issue_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id),
    INDEX idx_model_date (model_id, vote_date),
    INDEX idx_fingerprint_date (fingerprint_hash, vote_date),
    INDEX idx_vote_date (vote_date),
    UNIQUE KEY unique_vote (model_id, fingerprint_hash, vote_date)
) ENGINE=InnoDB;

-- Comments table (heavily rate limited)
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL,
    fingerprint_hash VARCHAR(64) NOT NULL,
    comment_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id),
    INDEX idx_model_approved (model_id, is_approved),
    INDEX idx_created (created_at)
);

-- Daily aggregates for performance
CREATE TABLE IF NOT EXISTS daily_stats (
    model_id VARCHAR(100) NOT NULL,
    stat_date DATE NOT NULL,
    total_votes INT DEFAULT 0,
    avg_performance DECIMAL(3,2),
    avg_speed DECIMAL(3,2),
    avg_intelligence DECIMAL(3,2),
    avg_reliability DECIMAL(3,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (model_id, stat_date),
    FOREIGN KEY (model_id) REFERENCES models(id),
    INDEX idx_date (stat_date)
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    fingerprint_hash VARCHAR(64) NOT NULL,
    action_type ENUM('vote', 'comment') NOT NULL,
    model_id VARCHAR(255) NOT NULL DEFAULT '__GLOBAL__',
    count INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fingerprint_hash, action_type, model_id),
    INDEX idx_window (window_start),
    INDEX idx_fingerprint_model (fingerprint_hash, model_id)
);

-- Stored procedure to clean old rate limits
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS cleanup_rate_limits()
BEGIN
    DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL 25 HOUR);
END//
DELIMITER ;