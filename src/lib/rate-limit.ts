import { query, queryOne } from './db';

interface RateLimit {
  fingerprint_hash: string;
  action_type: 'vote' | 'comment';
  model_id?: string;
  count: number;
  window_start: Date;
}

export async function checkRateLimit(
  fingerprintHash: string,
  action: 'vote' | 'comment',
  modelId?: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '86400000');
  const maxRequests = action === 'vote' ? 1 : 3; // 1 vote per day, 3 comments per day
  
  // Convert milliseconds to seconds for MySQL INTERVAL
  const windowSeconds = Math.floor(windowMs / 1000);
  
  // For votes, check per model. For comments, check globally
  const effectiveModelId = action === 'vote' && modelId ? modelId : '__GLOBAL__';
  
  // Atomic increment with conditional logic to prevent race conditions
  const result = await query<any>(
    `INSERT INTO rate_limits (fingerprint_hash, action_type, model_id, count, window_start)
     VALUES (?, ?, ?, 1, NOW())
     ON DUPLICATE KEY UPDATE
       count = CASE
         WHEN window_start <= DATE_SUB(NOW(), INTERVAL ? SECOND) THEN 1
         WHEN count < ? THEN count + 1
         ELSE count
       END,
       window_start = CASE
         WHEN window_start <= DATE_SUB(NOW(), INTERVAL ? SECOND) THEN NOW()
         ELSE window_start
       END`,
    [fingerprintHash, action, effectiveModelId, windowSeconds, maxRequests, windowSeconds]
  );
  
  // Get the current state after atomic update
  const currentLimit = await queryOne<RateLimit>(
    `SELECT * FROM rate_limits 
     WHERE fingerprint_hash = ? AND action_type = ? AND model_id = ?
     AND window_start > DATE_SUB(NOW(), INTERVAL ? SECOND)`,
    [fingerprintHash, action, effectiveModelId, windowSeconds]
  );
  
  if (!currentLimit) {
    // Window expired between operations (rare edge case)
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  const allowed = currentLimit.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - currentLimit.count);
  
  return { allowed, remaining };
}

export async function cleanupRateLimits(): Promise<void> {
  await query('CALL cleanup_rate_limits()');
}