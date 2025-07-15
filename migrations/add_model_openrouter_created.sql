-- Add openrouter_created_at column to store the creation timestamp from OpenRouter API
ALTER TABLE models 
ADD COLUMN openrouter_created_at BIGINT AFTER context_length;

-- Add index for sorting by OpenRouter creation date
ALTER TABLE models 
ADD INDEX idx_openrouter_created (openrouter_created_at DESC);