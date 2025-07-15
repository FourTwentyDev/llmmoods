import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { Model } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const { modelId } = await params;
    const decodedModelId = decodeURIComponent(modelId);
    
    const model = await queryOne<Model>(`
      SELECT 
        m.*,
        COALESCE(ds.total_votes, 0) as votes_today,
        COALESCE(ds.avg_performance, 0) as current_performance,
        COALESCE(ds.avg_speed, 0) as current_speed,
        COALESCE(ds.avg_intelligence, 0) as current_intelligence,
        COALESCE(ds.avg_reliability, 0) as current_reliability
      FROM models m
      LEFT JOIN daily_stats ds ON m.id = ds.model_id 
        AND ds.stat_date = CURDATE()
      WHERE m.id = ? AND m.is_active = TRUE
    `, [decodedModelId]);
    
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    
    return NextResponse.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}