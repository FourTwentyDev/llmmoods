import { syncModelsFromOpenRouter, ensureFallbackModels } from '@/lib/models';
import { cleanupRateLimits } from '@/lib/rate-limit';
import { apiSuccess, commonErrors } from '@/lib/api-response';

export async function GET(request: Request) {
  // Verify cron secret if in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return commonErrors.unauthorized();
  }

  try {
    // Sync models from OpenRouter
    await syncModelsFromOpenRouter();
    
    // Ensure fallback models exist
    await ensureFallbackModels();
    
    // Cleanup old rate limits
    await cleanupRateLimits();
    
    return apiSuccess(
      { timestamp: new Date().toISOString() },
      'Models synced and cleanup completed'
    );
  } catch (error) {
    console.error('Cron job failed:', error);
    return commonErrors.serverError('Failed to sync models');
  }
}