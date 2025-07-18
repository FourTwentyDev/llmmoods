import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateFingerprint } from '@/lib/fingerprint';
import { query } from '@/lib/db';
import { z } from 'zod';
import { apiSuccess, commonErrors } from '@/lib/api-response';

// Validation schema für eingehende Kommentare
const commentSchema = z.object({
  model_id: z.string().min(1).max(100),
  comment_text: z.string().min(1).max(1000).trim(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const fingerprint = await generateFingerprint(req);
    const { allowed } = await checkRateLimit(fingerprint, 'comment');
    
    if (!allowed) {
      return commonErrors.rateLimit('Comment limit reached (max 3 per day)');
    }

    // Parse und validiere Request body
    const body = await req.json();
    const validation = commentSchema.safeParse(body);
    
    if (!validation.success) {
      return commonErrors.validationError('Invalid input', validation.error.issues);
    }

    const { model_id, comment_text } = validation.data;

    // Prüfe ob Model existiert
    const modelCheck = await query<{ id: string }>(
      'SELECT id FROM models WHERE id = ?',
      [model_id]
    );

    if (!Array.isArray(modelCheck) || modelCheck.length === 0) {
      return commonErrors.notFound('Model not found');
    }

    // Speichere Kommentar mit automatischer Approval (vorerst)
    // Nutze Prepared Statements gegen SQL Injection
    await query(
      `INSERT INTO comments (model_id, fingerprint_hash, comment_text, is_approved) 
       VALUES (?, ?, ?, ?)`,
      [model_id, fingerprint, comment_text, true] // is_approved = true für jetzt
    );

    return apiSuccess(
      { id: 'new' },
      'Comment posted successfully',
      201
    );

  } catch (error) {
    console.error('Error saving comment:', error);
    return commonErrors.serverError('Failed to save comment');
  }
}