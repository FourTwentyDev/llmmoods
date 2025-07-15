import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface RankingRow extends RowDataPacket {
  id: string;
  name: string;
  provider: string;
  category: string;
  avg_performance: number;
  avg_intelligence: number;
  vote_count: number;
  overall_score: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'today';
    const category = searchParams.get('category');
    
    const connection = await getConnection();
    
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = 'AND v.created_at >= CURDATE()';
        break;
      case 'week':
        dateFilter = 'AND v.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        break;
      case 'month':
        dateFilter = 'AND v.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        break;
    }
    
    const query = `
      SELECT 
        m.id,
        m.name,
        m.provider,
        m.category,
        AVG(v.performance_rating) as avg_performance,
        AVG(v.intelligence_rating) as avg_intelligence,
        COUNT(v.id) as vote_count,
        ROUND((AVG(v.performance_rating) + AVG(v.intelligence_rating)) / 2, 2) as overall_score
      FROM models m
      LEFT JOIN votes v ON m.id = v.model_id ${dateFilter}
      WHERE 1=1
      ${category ? 'AND m.category = ?' : ''}
      GROUP BY m.id
      HAVING vote_count > 0
      ORDER BY overall_score DESC, vote_count DESC
      LIMIT 10
    `;
    
    const params = category ? [category] : [];
    const [rankings] = await connection.execute<RankingRow[]>(query, params);
    
    return NextResponse.json({
      period,
      rankings
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=300'
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