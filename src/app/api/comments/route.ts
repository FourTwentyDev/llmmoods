import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateFingerprint } from '@/lib/fingerprint';
import { query, queryOne } from '@/lib/db';
import { z } from 'zod';

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
      return NextResponse.json(
        { error: 'Comment limit reached (max 3 per day)' },
        { status: 429 }
      );
    }

    // Parse und validiere Request body
    const body = await req.json();
    const validation = commentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { model_id, comment_text } = validation.data;

    // Prüfe ob Model existiert
    const modelCheck = await query(
      'SELECT id FROM models WHERE id = ?',
      [model_id]
    );

    if (modelCheck.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Speichere Kommentar mit automatischer Approval (vorerst)
    // Nutze Prepared Statements gegen SQL Injection
    const result = await query(
      `INSERT INTO comments (model_id, fingerprint_hash, comment_text, is_approved) 
       VALUES (?, ?, ?, ?)`,
      [model_id, fingerprint, comment_text, true] // is_approved = true für jetzt
    );

    return NextResponse.json(
      { 
        success: true,
        message: 'Comment posted successfully',
        id: (result as any).insertId || 'new'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}