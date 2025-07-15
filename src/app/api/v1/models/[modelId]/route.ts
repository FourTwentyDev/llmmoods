import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import type { Model } from '@/types/database';
import { RowDataPacket } from 'mysql2';

interface ModelRow extends Model, RowDataPacket {}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const connection = await getConnection();
    const { modelId } = await params;
    
    const [models] = await connection.execute<ModelRow[]>(
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