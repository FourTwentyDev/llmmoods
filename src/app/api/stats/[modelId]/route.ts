import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseIntSafe } from '@/lib/utils';
import { commonErrors } from '@/lib/api-response';

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
    const days = parseIntSafe(req.nextUrl.searchParams.get('days'), 30, 1, 365);
    
    const stats = await query<DailyStat>(
      `SELECT * FROM daily_stats 
       WHERE model_id = ? 
       AND stat_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY stat_date ASC`,
      [modelId, days]
    );
    
    // Get today's live stats with COALESCE to handle NULL values
    const todayStats = await query(
      `SELECT 
         COUNT(*) as total_votes,
         COALESCE(AVG(performance), 0) as avg_performance,
         COALESCE(AVG(speed), 0) as avg_speed,
         COALESCE(AVG(intelligence), 0) as avg_intelligence,
         COALESCE(AVG(reliability), 0) as avg_reliability
       FROM votes
       WHERE model_id = ? AND vote_date = CURDATE()`,
      [modelId]
    );
    
    return NextResponse.json({ 
      historical: Array.isArray(stats) ? stats : [],
      today: Array.isArray(todayStats) && todayStats[0] ? todayStats[0] : {
        total_votes: 0,
        avg_performance: 0,
        avg_speed: 0,
        avg_intelligence: 0,
        avg_reliability: 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return commonErrors.serverError('Failed to fetch statistics');
  }
}