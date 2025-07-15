import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Model } from '@/lib/models';

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
      // Determine sort order
      let orderBy = 'm.provider, m.name'; // default
      if (sort === 'newest') {
        orderBy = 'm.openrouter_created_at DESC';
      } else if (sort === 'oldest') {
        orderBy = 'm.openrouter_created_at ASC';
      } else if (sort === 'context') {
        orderBy = 'm.context_length DESC';
      }
      
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
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}