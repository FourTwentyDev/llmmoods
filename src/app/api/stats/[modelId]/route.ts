import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface DailyStat {
  stat_date: string;
  total_votes: number;
  avg_performance: number;
  avg_speed: number;
  avg_intelligence: number;
  avg_reliability: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const { modelId } = await params;
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    
    const stats = await query<DailyStat>(
      `SELECT * FROM daily_stats 
       WHERE model_id = ? 
       AND stat_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY stat_date ASC`,
      [modelId, days]
    );
    
    // Get today's live stats
    const todayStats = await query(
      `SELECT 
         COUNT(*) as total_votes,
         AVG(performance) as avg_performance,
         AVG(speed) as avg_speed,
         AVG(intelligence) as avg_intelligence,
         AVG(reliability) as avg_reliability
       FROM votes
       WHERE model_id = ? AND vote_date = CURDATE()`,
      [modelId]
    );
    
    return NextResponse.json({ 
      historical: stats,
      today: todayStats[0] 
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}