import { NextResponse } from 'next/server';
import { syncModelsFromOpenRouter, ensureFallbackModels } from '@/lib/models';
import { cleanupRateLimits } from '@/lib/rate-limit';

export async function GET(request: Request) {
  // Verify cron secret if in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Sync models from OpenRouter
    await syncModelsFromOpenRouter();
    
    // Ensure fallback models exist
    await ensureFallbackModels();
    
    // Cleanup old rate limits
    await cleanupRateLimits();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Models synced and cleanup completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Failed to sync models' },
      { status: 500 }
    );
  }
}