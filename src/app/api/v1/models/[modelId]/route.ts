import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    const connection = await getConnection();
    const { modelId } = params;
    
    const [models]: any = await connection.execute(
      `SELECT 
        id,
        name,
        provider,
        category,
        context_length,
        current_performance,
        current_intelligence,
        total_votes,
        ROUND((current_performance + current_intelligence) / 2, 2) as overall_score,
        updated_at
      FROM models
      WHERE id = ?`,
      [modelId]
    );
    
    if (models.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(models[0], {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}