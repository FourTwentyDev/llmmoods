import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Model } from '@/lib/models';

export async function GET() {
  try {
    const models = await query<Model>(
      `SELECT m.*, 
        COALESCE(ds.avg_performance, 0) as current_performance,
        COALESCE(ds.avg_intelligence, 0) as current_intelligence,
        COALESCE(ds.total_votes, 0) as votes_today
       FROM models m
       LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date = CURDATE()
       WHERE m.is_active = TRUE
       ORDER BY m.provider, m.name`
    );
    
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}