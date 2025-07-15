import { query, queryOne } from './db';

interface RateLimit {
  fingerprint_hash: string;
  action_type: 'vote' | 'comment';
  count: number;
  window_start: Date;
}

export async function checkRateLimit(
  fingerprintHash: string,
  action: 'vote' | 'comment'
): Promise<{ allowed: boolean; remaining: number }> {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '86400000');
  const maxRequests = action === 'vote' ? 1 : 3; // 1 vote per day, 3 comments per day
  
  // Convert milliseconds to seconds for MySQL INTERVAL
  const windowSeconds = Math.floor(windowMs / 1000);
  
  const existingLimit = await queryOne<RateLimit>(
    `SELECT * FROM rate_limits 
     WHERE fingerprint_hash = ? AND action_type = ? 
     AND window_start > DATE_SUB(NOW(), INTERVAL ? SECOND)`,
    [fingerprintHash, action, windowSeconds]
  );
  
  if (!existingLimit) {
    // First action in window
    await query(
      `INSERT INTO rate_limits (fingerprint_hash, action_type, count, window_start) 
       VALUES (?, ?, 1, NOW())`,
      [fingerprintHash, action]
    );
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (existingLimit.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment counter
  await query(
    `UPDATE rate_limits SET count = count + 1 
     WHERE fingerprint_hash = ? AND action_type = ?`,
    [fingerprintHash, action]
  );
  
  return { allowed: true, remaining: maxRequests - existingLimit.count - 1 };
}

export async function cleanupRateLimits(): Promise<void> {
  await query('CALL cleanup_rate_limits()');
}