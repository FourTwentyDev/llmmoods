import crypto from 'crypto';

export async function generateFingerprint(req: Request): Promise<string> {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const acceptLanguage = req.headers.get('accept-language') || 'unknown';
  const acceptEncoding = req.headers.get('accept-encoding') || 'unknown';
  
  // Create a unique fingerprint without storing PII
  const fingerprintData = `${ip}-${userAgent}-${acceptLanguage}-${acceptEncoding}`;
  
  return crypto
    .createHash('sha256')
    .update(fingerprintData)
    .digest('hex');
}