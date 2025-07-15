import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateFingerprint } from '@/lib/fingerprint';
import { checkRateLimit } from '@/lib/rate-limit';

interface VoteRequest {
  modelId: string;
  ratings: {
    performance?: number;
    speed?: number;
    intelligence?: number;
    reliability?: number;
  };
  issueType?: string;
}

export async function POST(req: NextRequest) {
  try {
    const fingerprintHash = await generateFingerprint(req);
    const body: VoteRequest = await req.json();
    const { modelId, ratings, issueType } = body;
    
    // Validate inputs early
    if (!modelId || !ratings || Object.keys(ratings).length === 0) {
      return NextResponse.json(
        { error: 'Invalid vote data' },
        { status: 400 }
      );
    }
    
    // Check rate limit per model
    const { allowed, remaining } = await checkRateLimit(fingerprintHash, 'vote', modelId);
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You can vote once per day per model.' },
        { status: 429 }
      );
    }
    
    // Insert vote
    await query(
      `INSERT INTO votes (model_id, vote_date, fingerprint_hash, performance, speed, intelligence, reliability, issue_type)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       performance = VALUES(performance),
       speed = VALUES(speed),
       intelligence = VALUES(intelligence),
       reliability = VALUES(reliability),
       issue_type = VALUES(issue_type),
       created_at = NOW()`,
      [
        modelId,
        fingerprintHash,
        ratings.performance || null,
        ratings.speed || null,
        ratings.intelligence || null,
        ratings.reliability || null,
        issueType || null
      ]
    );
    
    // Update daily stats
    await query(
      `INSERT INTO daily_stats (model_id, stat_date, total_votes, avg_performance, avg_speed, avg_intelligence, avg_reliability)
       SELECT 
         model_id,
         vote_date,
         COUNT(*) as total_votes,
         AVG(performance) as avg_performance,
         AVG(speed) as avg_speed,
         AVG(intelligence) as avg_intelligence,
         AVG(reliability) as avg_reliability
       FROM votes
       WHERE model_id = ? AND vote_date = CURDATE()
       GROUP BY model_id, vote_date
       ON DUPLICATE KEY UPDATE
       total_votes = VALUES(total_votes),
       avg_performance = VALUES(avg_performance),
       avg_speed = VALUES(avg_speed),
       avg_intelligence = VALUES(avg_intelligence),
       avg_reliability = VALUES(avg_reliability)`,
      [modelId]
    );
    
    return NextResponse.json({ 
      success: true, 
      remaining,
      message: 'Vote recorded successfully!' 
    });
  } catch (error) {
    // Error recording vote - consider logging to monitoring service
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}