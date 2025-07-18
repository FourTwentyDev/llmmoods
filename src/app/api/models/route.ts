import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Model } from '@/lib/models';
import { commonErrors } from '@/lib/api-response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'featured';
    const provider = searchParams.get('provider');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    
    let models;
    
    // Build WHERE conditions
    const conditions = ['m.is_active = TRUE'];
    const params = [];
    
    if (provider && provider !== 'all') {
      conditions.push('m.provider = ?');
      params.push(provider);
    }
    
    if (category && category !== 'all') {
      conditions.push('m.category = ?');
      params.push(category);
    }
    
    if (search) {
      conditions.push('(m.name LIKE ? OR m.provider LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const whereClause = conditions.join(' AND ');
    
    if (view === 'featured') {
      // Get latest model per provider with filters
      const subqueryConditions = ['is_active = TRUE', 'openrouter_created_at IS NOT NULL'];
      if (provider && provider !== 'all') {
        subqueryConditions.push('provider = ?');
      }
      if (category && category !== 'all') {
        subqueryConditions.push('category = ?');
      }
      
      const subqueryWhere = subqueryConditions.join(' AND ');
      const subqueryParams = params.filter((_, i) => i < (provider && provider !== 'all' ? 1 : 0) + (category && category !== 'all' ? 1 : 0));
      
      models = await query<Model>(
        `SELECT m.*, 
          COALESCE(ds.avg_performance, 0) as current_performance,
          COALESCE(ds.avg_intelligence, 0) as current_intelligence,
          COALESCE(ds.total_votes, 0) as votes_today
         FROM models m
         INNER JOIN (
           SELECT provider, MAX(openrouter_created_at) as latest_created
           FROM models
           WHERE ${subqueryWhere}
           GROUP BY provider
         ) latest ON m.provider = latest.provider AND m.openrouter_created_at = latest.latest_created
         LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date = CURDATE()
         WHERE ${whereClause}
         ORDER BY m.openrouter_created_at DESC`,
        [...subqueryParams, ...params]
      );
    } else {
      // Determine sort order with whitelist to prevent SQL injection
      const sortOptions: Record<string, string> = {
        'default': 'm.provider, m.name',
        'newest': 'm.openrouter_created_at DESC',
        'oldest': 'm.openrouter_created_at ASC',
        'context': 'm.context_length DESC'
      };
      const orderBy = sortOptions[sort] || sortOptions['default'];
      
      // Get all models with filters
      models = await query<Model>(
        `SELECT m.*, 
          COALESCE(ds.avg_performance, 0) as current_performance,
          COALESCE(ds.avg_intelligence, 0) as current_intelligence,
          COALESCE(ds.total_votes, 0) as votes_today
         FROM models m
         LEFT JOIN daily_stats ds ON m.id = ds.model_id AND ds.stat_date = CURDATE()
         WHERE ${whereClause}
         ORDER BY ${orderBy}`,
        params
      );
    }
    
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return commonErrors.serverError('Failed to fetch models');
  }
}