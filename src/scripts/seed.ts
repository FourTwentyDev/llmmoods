import { config } from 'dotenv';
import { ensureFallbackModels, syncModelsFromOpenRouter } from '../lib/models';

// Try both .env and .env.local
config({ path: '.env' });
config({ path: '.env.local' });

// Debug environment variables
console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set!');
    console.error('Please ensure your .env file contains DATABASE_URL');
    process.exit(1);
  }
  
  console.log('Seeding database with fallback models...');
  
  try {
    // First add fallback models
    await ensureFallbackModels();
    console.log('✅ Fallback models added');
    
    // Then try to sync from OpenRouter
    console.log('Syncing models from OpenRouter...');
    await syncModelsFromOpenRouter();
    
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();