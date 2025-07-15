'use client';

import { Model } from '@/types';
import { getMoodEmoji, getMoodColor, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, GitCompare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ModelCardProps {
  model: Model;
  onVoteClick: () => void;
  hasVoted?: boolean;
}

export function ModelCard({ model, onVoteClick, hasVoted }: ModelCardProps) {
  const router = useRouter();
  const overallScore = (
    (model.current_performance || 0) + 
    (model.current_intelligence || 0)
  ) / 2 || 0;

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/compare?models=${model.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col h-full relative group">
      <Link 
        href={`/stats/${encodeURIComponent(model.id)}`}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View stats for ${model.name}`}
      />
      
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-2">
            <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">{model.name}</h3>
            <p className="text-sm text-gray-500">{model.provider}</p>
          </div>
          <div className={cn("text-3xl flex-shrink-0", getMoodColor(overallScore))}>
            {getMoodEmoji(overallScore)}
          </div>
        </div>

        <div className="flex-1 min-h-[40px]">
          {overallScore > 3.5 && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Performing well</span>
            </div>
          )}
          {overallScore < 2.5 && overallScore > 0 && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>Having issues</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{model.votes_today || 0} votes today</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVoteClick();
              }}
              disabled={hasVoted}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium transition-all relative z-20",
                hasVoted
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              {hasVoted ? 'Already voted' : 'Rate'}
            </button>
            <button
              onClick={handleCompare}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all relative z-20"
              title="Compare with other models"
            >
              <GitCompare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}