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
  
  const whereClause = 'WHERE fingerprint_hash = ? AND action_type = ? AND model_id = ? AND window_start > DATE_SUB(NOW(), INTERVAL ? SECOND)';
  const params = [fingerprintHash, action, effectiveModelId, windowSeconds];
  
  const existingLimit = await queryOne<RateLimit>(
    `SELECT * FROM rate_limits ${whereClause}`,
    params
  );
  
  if (!existingLimit) {
    // First action in window or expired record
    await query(
      `INSERT INTO rate_limits (fingerprint_hash, action_type, model_id, count, window_start) 
       VALUES (?, ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE 
         count = IF(window_start > DATE_SUB(NOW(), INTERVAL ? SECOND), count + 1, 1),
         window_start = IF(window_start > DATE_SUB(NOW(), INTERVAL ? SECOND), window_start, NOW())`,
      [fingerprintHash, action, effectiveModelId, windowSeconds, windowSeconds]
    );
    
    // Re-check to get the actual count after insert/update
    const updatedLimit = await queryOne<RateLimit>(
      `SELECT * FROM rate_limits WHERE fingerprint_hash = ? AND action_type = ? AND model_id = ?`,
      [fingerprintHash, action, effectiveModelId]
    );
    
    if (updatedLimit && updatedLimit.count > maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    return { allowed: true, remaining: maxRequests - (updatedLimit?.count || 1) };
  }
  
  if (existingLimit.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment counter
  await query(
    `UPDATE rate_limits SET count = count + 1 
     WHERE fingerprint_hash = ? AND action_type = ? AND model_id = ?`,
    [fingerprintHash, action, effectiveModelId]
  );
  
  return { allowed: true, remaining: maxRequests - existingLimit.count - 1 };
}

export async function cleanupRateLimits(): Promise<void> {
  await query('CALL cleanup_rate_limits()');
}