import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { parseIntSafe } from '@/lib/utils';
import { commonErrors } from '@/lib/api-response';

interface StatsRow extends RowDataPacket {
  id: string;
  name: string;
  provider: string;
  category: string;
  total_votes: string;
  avg_performance: string;
  avg_intelligence: string;
  avg_speed: string;
  avg_reliability: string;
  days_with_votes?: string;
}

interface TrendingRow extends RowDataPacket {
  id: string;
  name: string;
  provider: string;
  category: string;
  votes_today: string;
  votes_yesterday: string;
  vote_growth: string;
  performance_today: string;
  intelligence_today: string;
}

interface ProviderStatsRow extends RowDataPacket {
  provider: string;
  model_count: string;
  models_with_votes: string;
  total_votes: string;
  avg_performance: string;
  avg_intelligence: string;
  avg_speed: string;
  avg_reliability: string;
}

interface CategoryStatsRow extends RowDataPacket {
  category: string;
  model_count: string;
  models_with_votes: string;
  total_votes: string;
  avg_performance: string;
  avg_intelligence: string;
  avg_speed: string;
  avg_reliability: string;
}

interface AggregateStatsRow extends RowDataPacket {
  total_models: string;
  models_with_votes: string;
  total_votes: string;
  avg_performance: string;
  avg_intelligence: string;
  avg_speed: string;
  avg_reliability: string;
}

interface TrendsRow extends RowDataPacket {
  stat_date: string;
  models_voted: string;
  total_votes: string;
  avg_performance: string;
  avg_intelligence: string;
  avg_speed: string;
  avg_reliability: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = parseIntSafe(searchParams.get('period'), 30, 1, 365);

  try {
    // Get date range
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - period);
    const dateStr = dateLimit.toISOString().split('T')[0];

    // 1. Top performing models (by average performance in the period)
    const topByPerformance = await query<StatsRow>(`
      SELECT 
        m.id,
        m.name,
        m.provider,
        m.category,
        COUNT(DISTINCT ds.stat_date) as days_with_votes,
        SUM(ds.total_votes) as total_votes,
        AVG(ds.avg_performance) as avg_performance,
        AVG(ds.avg_intelligence) as avg_intelligence,
        AVG(ds.avg_speed) as avg_speed,
        AVG(ds.avg_reliability) as avg_reliability
      FROM models m
      LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date >= ?
      WHERE m.is_active = true
      GROUP BY m.id
      HAVING days_with_votes > 0
      ORDER BY avg_performance DESC
      LIMIT 10
    `, [dateStr]);

    // 2. Most voted models
    const topByVotes = await query<StatsRow>(`
      SELECT 
        m.id,
        m.name,
        m.provider,
        m.category,
        SUM(ds.total_votes) as total_votes,
        AVG(ds.avg_performance) as avg_performance,
        AVG(ds.avg_intelligence) as avg_intelligence,
        AVG(ds.avg_speed) as avg_speed,
        AVG(ds.avg_reliability) as avg_reliability
      FROM models m
      LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date >= ?
      WHERE m.is_active = true
      GROUP BY m.id
      HAVING total_votes > 0
      ORDER BY total_votes DESC
      LIMIT 10
    `, [dateStr]);

    // 3. Statistics by provider
    const byProvider = await query<ProviderStatsRow>(`
      SELECT 
        m.provider,
        COUNT(DISTINCT m.id) as model_count,
        COUNT(DISTINCT CASE WHEN ds.total_votes > 0 THEN m.id END) as models_with_votes,
        COALESCE(SUM(ds.total_votes), 0) as total_votes,
        AVG(ds.avg_performance) as avg_performance,
        AVG(ds.avg_intelligence) as avg_intelligence,
        AVG(ds.avg_speed) as avg_speed,
        AVG(ds.avg_reliability) as avg_reliability
      FROM models m
      LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date >= ?
      WHERE m.is_active = true
      GROUP BY m.provider
      ORDER BY total_votes DESC
    `, [dateStr]);

    // 4. Statistics by category
    const byCategory = await query<CategoryStatsRow>(`
      SELECT 
        m.category,
        COUNT(DISTINCT m.id) as model_count,
        COUNT(DISTINCT CASE WHEN ds.total_votes > 0 THEN m.id END) as models_with_votes,
        COALESCE(SUM(ds.total_votes), 0) as total_votes,
        AVG(ds.avg_performance) as avg_performance,
        AVG(ds.avg_intelligence) as avg_intelligence,
        AVG(ds.avg_speed) as avg_speed,
        AVG(ds.avg_reliability) as avg_reliability
      FROM models m
      LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date >= ?
      WHERE m.is_active = true
      GROUP BY m.category
      ORDER BY total_votes DESC
    `, [dateStr]);

    // 5. Overall aggregate stats
    const aggregateStats = await query<AggregateStatsRow>(`
      SELECT 
        COUNT(DISTINCT m.id) as total_models,
        COUNT(DISTINCT CASE WHEN ds.total_votes > 0 THEN m.id END) as models_with_votes,
        COALESCE(SUM(ds.total_votes), 0) as total_votes,
        AVG(ds.avg_performance) as avg_performance,
        AVG(ds.avg_intelligence) as avg_intelligence,
        AVG(ds.avg_speed) as avg_speed,
        AVG(ds.avg_reliability) as avg_reliability
      FROM models m
      LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date >= ?
      WHERE m.is_active = true
    `, [dateStr]);

    // 6. Daily trends for the period
    const trends = await query<TrendsRow>(`
      SELECT 
        ds.stat_date,
        COUNT(DISTINCT ds.model_id) as models_voted,
        SUM(ds.total_votes) as total_votes,
        AVG(ds.avg_performance) as avg_performance,
        AVG(ds.avg_intelligence) as avg_intelligence,
        AVG(ds.avg_speed) as avg_speed,
        AVG(ds.avg_reliability) as avg_reliability
      FROM daily_stats ds
      WHERE ds.stat_date >= ?
      GROUP BY ds.stat_date
      ORDER BY ds.stat_date ASC
    `, [dateStr]);

    // 7. Today's trending models (high vote growth)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const trending = await query<TrendingRow>(`
      SELECT 
        m.id,
        m.name,
        m.provider,
        m.category,
        COALESCE(today.total_votes, 0) as votes_today,
        COALESCE(yesterday.total_votes, 0) as votes_yesterday,
        COALESCE(today.total_votes, 0) - COALESCE(yesterday.total_votes, 0) as vote_growth,
        today.avg_performance as performance_today,
        today.avg_intelligence as intelligence_today
      FROM models m
      LEFT JOIN (
        SELECT model_id, total_votes, avg_performance, avg_intelligence 
        FROM daily_stats 
        WHERE stat_date = ?
      ) today ON m.id = today.model_id
      LEFT JOIN (
        SELECT model_id, total_votes 
        FROM daily_stats 
        WHERE stat_date = ?
      ) yesterday ON m.id = yesterday.model_id
      WHERE m.is_active = true AND COALESCE(today.total_votes, 0) > 0
      ORDER BY vote_growth DESC, votes_today DESC
      LIMIT 5
    `, [today, yesterday]);

    // Format the response
    const response = {
      period,
      dateRange: {
        from: dateStr,
        to: new Date().toISOString().split('T')[0]
      },
      topModels: {
        byPerformance: topByPerformance.map(row => ({
          ...row,
          total_votes: parseInt(row.total_votes) || 0,
          avg_performance: parseFloat(row.avg_performance) || 0,
          avg_intelligence: parseFloat(row.avg_intelligence) || 0,
          avg_speed: parseFloat(row.avg_speed) || 0,
          avg_reliability: parseFloat(row.avg_reliability) || 0
        })),
        byVotes: topByVotes.map(row => ({
          ...row,
          total_votes: parseInt(row.total_votes) || 0,
          avg_performance: parseFloat(row.avg_performance) || 0,
          avg_intelligence: parseFloat(row.avg_intelligence) || 0,
          avg_speed: parseFloat(row.avg_speed) || 0,
          avg_reliability: parseFloat(row.avg_reliability) || 0
        })),
        trending: trending.map(row => ({
          ...row,
          votes_today: parseInt(row.votes_today) || 0,
          votes_yesterday: parseInt(row.votes_yesterday) || 0,
          vote_growth: parseInt(row.vote_growth) || 0,
          performance_today: parseFloat(row.performance_today) || 0,
          intelligence_today: parseFloat(row.intelligence_today) || 0
        }))
      },
      aggregateStats: aggregateStats[0] ? {
        total_models: parseInt(aggregateStats[0].total_models) || 0,
        models_with_votes: parseInt(aggregateStats[0].models_with_votes) || 0,
        total_votes: parseInt(aggregateStats[0].total_votes) || 0,
        avg_performance: parseFloat(aggregateStats[0].avg_performance) || 0,
        avg_intelligence: parseFloat(aggregateStats[0].avg_intelligence) || 0,
        avg_speed: parseFloat(aggregateStats[0].avg_speed) || 0,
        avg_reliability: parseFloat(aggregateStats[0].avg_reliability) || 0
      } : {
        total_models: 0,
        models_with_votes: 0,
        total_votes: 0,
        avg_performance: 0,
        avg_intelligence: 0,
        avg_speed: 0,
        avg_reliability: 0
      },
      byProvider: byProvider.map(row => ({
        provider: row.provider,
        modelCount: row.model_count,
        modelsWithVotes: row.models_with_votes,
        totalVotes: parseInt(row.total_votes) || 0,
        avgPerformance: parseFloat(row.avg_performance) || 0,
        avgIntelligence: parseFloat(row.avg_intelligence) || 0,
        avgSpeed: parseFloat(row.avg_speed) || 0,
        avgReliability: parseFloat(row.avg_reliability) || 0
      })),
      byCategory: byCategory.map(row => ({
        category: row.category,
        modelCount: row.model_count,
        modelsWithVotes: row.models_with_votes,
        totalVotes: parseInt(row.total_votes) || 0,
        avgPerformance: parseFloat(row.avg_performance) || 0,
        avgIntelligence: parseFloat(row.avg_intelligence) || 0,
        avgSpeed: parseFloat(row.avg_speed) || 0,
        avgReliability: parseFloat(row.avg_reliability) || 0
      })),
      trends: trends.map(row => ({
        date: row.stat_date,
        modelsVoted: row.models_voted,
        totalVotes: parseInt(row.total_votes) || 0,
        avgPerformance: parseFloat(row.avg_performance) || 0,
        avgIntelligence: parseFloat(row.avg_intelligence) || 0,
        avgSpeed: parseFloat(row.avg_speed) || 0,
        avgReliability: parseFloat(row.avg_reliability) || 0
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch overall stats:', error);
    return commonErrors.serverError('Failed to fetch statistics');
  }
}