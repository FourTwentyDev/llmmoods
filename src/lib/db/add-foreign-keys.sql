-- Add Foreign Key Constraints
-- Run this after all tables have been created

USE llmmood;

-- Add foreign key for votes table
ALTER TABLE votes
ADD CONSTRAINT fk_votes_model_id
FOREIGN KEY (model_id) REFERENCES models(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add foreign key for comments table
ALTER TABLE comments
ADD CONSTRAINT fk_comments_model_id
FOREIGN KEY (model_id) REFERENCES models(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add foreign key for daily_stats table
ALTER TABLE daily_stats
ADD CONSTRAINT fk_daily_stats_model_id
FOREIGN KEY (model_id) REFERENCES models(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Optional: Check if foreign keys were added successfully
-- SHOW CREATE TABLE votes;
-- SHOW CREATE TABLE comments;
-- SHOW CREATE TABLE daily_stats;