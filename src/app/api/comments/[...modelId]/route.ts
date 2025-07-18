import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';
import { commonErrors } from '@/lib/api-response';

interface Comment {
  id: number;
  comment_text: string;
  created_at: Date;
  author_hash: string;
}

// Validation für modelId parameter
const modelIdSchema = z.string().min(1).max(100);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ modelId: string[] }> }
) {
  try {
    // Await params (required in Next.js 15)
    const { modelId: modelIdParts } = await params;
    
    // Verbinde die modelId-Teile wieder zu einem String
    const modelId = modelIdParts.join('/');
    
    // Validiere modelId
    const validation = modelIdSchema.safeParse(modelId);
    
    if (!validation.success) {
      return commonErrors.badRequest('Invalid model ID');
    }

    const validatedModelId = validation.data;

    // Hole nur approved Kommentare (auch wenn momentan alle approved sind)
    // Sortiere nach Datum, neueste zuerst
    const comments = await query(
      `SELECT 
        id,
        comment_text,
        created_at,
        SUBSTRING(fingerprint_hash, 1, 8) as author_hash
       FROM comments 
       WHERE model_id = ? AND is_approved = true
       ORDER BY created_at DESC
       LIMIT 50`,
      [validatedModelId]
    );

    // Formatiere Timestamps
    if (!Array.isArray(comments)) {
      return NextResponse.json({
        comments: [],
        count: 0
      });
    }
    
    const formattedComments = (comments as Comment[]).map(comment => ({
      id: comment.id,
      text: comment.comment_text,
      authorHash: comment.author_hash, // Kurzer Hash als "Anonym-ID"
      createdAt: comment.created_at,
      relativeTime: getRelativeTime(new Date(comment.created_at))
    }));

    return NextResponse.json({
      comments: formattedComments,
      count: formattedComments.length
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return commonErrors.serverError('Failed to fetch comments');
  }
}

// Helper für relative Zeitangaben
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US');
}