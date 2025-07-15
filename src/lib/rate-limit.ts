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
  const whereClause = action === 'vote' && modelId 
    ? 'WHERE fingerprint_hash = ? AND action_type = ? AND model_id = ? AND window_start > DATE_SUB(NOW(), INTERVAL ? SECOND)'
    : 'WHERE fingerprint_hash = ? AND action_type = ? AND model_id IS NULL AND window_start > DATE_SUB(NOW(), INTERVAL ? SECOND)';
  
  const params = action === 'vote' && modelId
    ? [fingerprintHash, action, modelId, windowSeconds]
    : [fingerprintHash, action, windowSeconds];
  
  const existingLimit = await queryOne<RateLimit>(
    `SELECT * FROM rate_limits ${whereClause}`,
    params
  );
  
  if (!existingLimit) {
    // First action in window
    const insertParams = action === 'vote' && modelId
      ? [fingerprintHash, action, modelId]
      : [fingerprintHash, action, null];
      
    await query(
      `INSERT INTO rate_limits (fingerprint_hash, action_type, model_id, count, window_start) 
       VALUES (?, ?, ?, 1, NOW())`,
      insertParams
    );
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (existingLimit.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment counter
  const updateWhereClause = action === 'vote' && modelId
    ? 'WHERE fingerprint_hash = ? AND action_type = ? AND model_id = ?'
    : 'WHERE fingerprint_hash = ? AND action_type = ? AND model_id IS NULL';
    
  const updateParams = action === 'vote' && modelId
    ? [fingerprintHash, action, modelId]
    : [fingerprintHash, action];
    
  await query(
    `UPDATE rate_limits SET count = count + 1 ${updateWhereClause}`,
    updateParams
  );
  
  return { allowed: true, remaining: maxRequests - existingLimit.count - 1 };
}

export async function cleanupRateLimits(): Promise<void> {
  await query('CALL cleanup_rate_limits()');
}