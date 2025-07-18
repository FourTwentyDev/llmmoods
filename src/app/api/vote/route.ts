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
    if (!modelId || typeof modelId !== 'string' || modelId.length > 100) {
      return commonErrors.badRequest('Invalid model ID');
    }
    
    if (!ratings || typeof ratings !== 'object' || Object.keys(ratings).length === 0) {
      return commonErrors.badRequest('Invalid vote data - ratings required');
    }
    
    // Validate rating values
    if (ratings.performance && (ratings.performance < 1 || ratings.performance > 4)) {
      return commonErrors.validationError('Performance rating must be between 1 and 4');
    }
    if (ratings.speed && (ratings.speed < 1 || ratings.speed > 5)) {
      return commonErrors.validationError('Speed rating must be between 1 and 5');
    }
    if (ratings.intelligence && (ratings.intelligence < 1 || ratings.intelligence > 5)) {
      return commonErrors.validationError('Intelligence rating must be between 1 and 5');
    }
    if (ratings.reliability && (ratings.reliability < 1 || ratings.reliability > 4)) {
      return commonErrors.validationError('Reliability rating must be between 1 and 4');
    }
    
    // Validate issueType if provided
    const validIssueTypes = ['hallucination', 'refused', 'off-topic', 'slow', 'error', 'other'];
    if (issueType && !validIssueTypes.includes(issueType)) {
      return commonErrors.validationError('Invalid issue type');
    }
    
    // Check if model exists
    const modelCheck = await query(
      'SELECT id FROM models WHERE id = ? AND is_active = TRUE',
      [modelId]
    );
    
    if (!Array.isArray(modelCheck) || modelCheck.length === 0) {
      return NextResponse.json(
        { error: 'Model not found. Please refresh the page and try again.' },
        { status: 404 }
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
    
    // Update daily stats with COALESCE to handle NULL values
    await query(
      `INSERT INTO daily_stats (model_id, stat_date, total_votes, avg_performance, avg_speed, avg_intelligence, avg_reliability)
       SELECT 
         model_id,
         vote_date,
         COUNT(*) as total_votes,
         COALESCE(AVG(performance), 0) as avg_performance,
         COALESCE(AVG(speed), 0) as avg_speed,
         COALESCE(AVG(intelligence), 0) as avg_intelligence,
         COALESCE(AVG(reliability), 0) as avg_reliability
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
    
    return apiSuccess(
      { remaining },
      'Vote recorded successfully!'
    );
  } catch (error) {
    console.error('Error recording vote:', error);
    
    // Check if it's a foreign key constraint error (model doesn't exist)
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'Model not found. Please refresh the page and try again.' },
        { status: 400 }
      );
    }
    
    return commonErrors.serverError('Failed to record vote. Please try again later.');
  }
}