-- Insert fallback models directly
USE llmmood;

INSERT IGNORE INTO models (id, name, provider, category) VALUES 
('gpt-4o', 'GPT-4o', 'OpenAI', 'llm'),
('gpt-4o-mini', 'GPT-4o Mini', 'OpenAI', 'llm'),
('claude-3-5-sonnet', 'Claude 3.5 Sonnet', 'Anthropic', 'llm'),
('claude-3-5-haiku', 'Claude 3.5 Haiku', 'Anthropic', 'llm'),
('gemini-2.0-flash', 'Gemini 2.0 Flash', 'Google', 'llm'),
('gemini-1.5-pro', 'Gemini 1.5 Pro', 'Google', 'llm'),
('llama-3.1-70b', 'Llama 3.1 70B', 'Meta', 'llm'),
('deepseek-v3', 'DeepSeek V3', 'DeepSeek', 'llm'),
('mistral-large', 'Mistral Large', 'Mistral', 'llm'),
('mixtral-8x7b', 'Mixtral 8x7B', 'Mistral', 'llm'),
('dall-e-3', 'DALL·E 3', 'OpenAI', 'image'),
('midjourney-v6', 'Midjourney v6', 'Midjourney', 'image'),
('stable-diffusion-xl', 'Stable Diffusion XL', 'Stability AI', 'image'),
('cursor-ai', 'Cursor AI', 'Cursor', 'code'),
('github-copilot', 'GitHub Copilot', 'GitHub', 'code');