'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, AlertCircle } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface Comment {
  id: number;
  text: string;
  authorHash: string;
  createdAt: string;
  relativeTime: string;
}

interface CommentSectionProps {
  modelId: string;
}

export default function CommentSection({ modelId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lade Kommentare
  useEffect(() => {
    fetchComments();
  }, [modelId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${modelId}`);
      if (!response.ok) throw new Error('Fehler beim Laden der Kommentare');
      
      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      setError('Please enter a comment');
      return;
    }
    
    if (trimmedComment.length > 1000) {
      setError('Comment is too long (max 1000 characters)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: modelId,
          comment_text: trimmedComment
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error saving comment');
      }

      // Erfolg - leere das Formular und lade Kommentare neu
      setNewComment('');
      await fetchComments();
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sanitize Kommentartext für sichere Anzeige
  const sanitizeComment = (text: string): string => {
    // DOMPurify entfernt gefährlichen Code aber erlaubt sicheres HTML
    // Wir erlauben hier gar kein HTML für maximale Sicherheit
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {/* Kommentar-Formular */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isSubmitting}
        />
        
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {newComment.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {/* Kommentarliste */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Anonymous#{comment.authorHash}
                </span>
                <span className="text-sm text-gray-500">
                  {comment.relativeTime}
                </span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">
                {sanitizeComment(comment.text)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}