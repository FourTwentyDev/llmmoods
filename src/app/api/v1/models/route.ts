import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { headers } from 'next/headers';
import type { Model } from '@/types/database';
import { RowDataPacket } from 'mysql2';

interface ModelRow extends Model, RowDataPacket {}
interface CountRow extends RowDataPacket {
  total: number;
}

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const origin = headersList.get('origin') || '*';
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const provider = searchParams.get('provider');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const connection = await getConnection();
    
    let query = `
      SELECT 
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
      WHERE 1=1
    `;
    
    const params: unknown[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (provider) {
      query += ' AND provider = ?';
      params.push(provider);
    }
    
    query += ' ORDER BY overall_score DESC, total_votes DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [models] = await connection.execute<ModelRow[]>(query, params);
    
    const countQuery = `
      SELECT COUNT(*) as total FROM models
      WHERE 1=1
      ${category ? ' AND category = ?' : ''}
      ${provider ? ' AND provider = ?' : ''}
    `;
    const countParams = params.slice(0, -2);
    const [countResult] = await connection.execute<CountRow[]>(countQuery, countParams);
    const total = countResult[0].total;
    
    return NextResponse.json({
      models,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': origin,
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