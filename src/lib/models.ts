import { query } from './db';

export interface Model {
  id: string;
  name: string;
  provider: string;
  category: 'llm' | 'image' | 'code' | 'audio' | 'video';
  context_length?: number;
  is_active: boolean;
}

export async function syncModelsFromOpenRouter(): Promise<void> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    const data = await response.json();
    
    // Filter for popular/relevant models
    const popularProviders = ['openai', 'anthropic', 'google', 'meta', 'mistralai', 'deepseek', 'x-ai'];
    const relevantModels = data.data.filter((model: any) => {
      const provider = model.id.split('/')[0].toLowerCase();
      return popularProviders.includes(provider) || 
             model.name.toLowerCase().includes('gpt') ||
             model.name.toLowerCase().includes('claude') ||
             model.name.toLowerCase().includes('gemini') ||
             model.name.toLowerCase().includes('llama') ||
             model.name.toLowerCase().includes('mixtral') ||
             model.name.toLowerCase().includes('mistral');
    });
    
    for (const model of relevantModels) {
      // Determine category based on modality
      let category = 'llm';
      if (model.architecture?.modality?.includes('image')) {
        category = 'image';
      } else if (model.id.includes('code') || model.name.toLowerCase().includes('code')) {
        category = 'code';
      }
      
      await query(
        `INSERT INTO models (id, name, provider, context_length, category) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         context_length = VALUES(context_length),
         category = VALUES(category),
         updated_at = NOW()`,
        [
          model.id,
          model.name || model.id,
          model.id.split('/')[0] || 'unknown',
          model.context_length || null,
          category
        ]
      );
    }
    
    // Successfully synced models from OpenRouter
  } catch (error) {
    console.error('Failed to sync models:', error);
  }
}

// Hardcoded popular models as fallback
export const FALLBACK_MODELS: Model[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', category: 'llm', is_active: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', category: 'llm', is_active: true },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', category: 'llm', is_active: true },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', category: 'llm', is_active: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', category: 'llm', is_active: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', category: 'llm', is_active: true },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', category: 'llm', is_active: true },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', category: 'llm', is_active: true },
];

export async function ensureFallbackModels(): Promise<void> {
  for (const model of FALLBACK_MODELS) {
    await query(
      `INSERT IGNORE INTO models (id, name, provider, category) VALUES (?, ?, ?, ?)`,
      [model.id, model.name, model.provider, model.category]
    );
  }
}