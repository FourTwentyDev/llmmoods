import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { Model } from '@/types';
import { commonErrors } from '@/lib/api-response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const { modelId } = await params;
    
    if (!modelId) {
      return commonErrors.badRequest('Model ID is required');
    }
    
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
      return commonErrors.notFound('Model not found');
    }
    
    return NextResponse.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    return commonErrors.serverError('Failed to fetch model details');
  }
}