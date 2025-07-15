import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Model } from '@/lib/models';

export async function GET() {
  try {
    // These are the top models that drive the most traffic
    const topModelIds = [
      'anthropic/claude-opus-4',
      'anthropic/claude-sonnet-4',
      'x-ai/grok-4',
      'google/gemini-2.5-pro'
    ];
    
    // Create placeholders for the IN clause
    const placeholders = topModelIds.map(() => '?').join(', ');
    
    // Fetch the top models with their current stats
    const models = await query<Model>(
      `SELECT m.*, 
        COALESCE(ds.avg_performance, 0) as current_performance,
        COALESCE(ds.avg_intelligence, 0) as current_intelligence,
        COALESCE(ds.total_votes, 0) as votes_today
       FROM models m
       LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date = CURDATE()
       WHERE m.id IN (${placeholders}) AND m.is_active = TRUE
       ORDER BY FIELD(m.id, ${placeholders})`,
      [...topModelIds, ...topModelIds] // Pass IDs twice: once for IN clause, once for FIELD ordering
    );
    
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching top models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top models' },
      { status: 500 }
    );
  }
}