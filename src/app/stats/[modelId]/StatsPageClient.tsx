'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StatsChart } from '@/components/StatsChart';
import { Model } from '@/types';
import { Brain, TrendingUp, TrendingDown, Minus, Users, Calendar, Sparkles, Star } from 'lucide-react';
import { getMoodEmoji, getMoodColor, cn } from '@/lib/utils';
import CommentSection from '@/components/CommentSection';
import Header from '@/components/Header';
import { VoteModal } from '@/components/VoteModal';
import { Vote } from '@/types';
import { trackVote } from '@/lib/analytics';

interface StatsData {
  date: string;
  performance: number;
  speed: number;
  intelligence: number;
  reliability: number;
  votes: number;
}

export function StatsPageClient() {
  const params = useParams();
  const modelId = decodeURIComponent(params.modelId as string);
  const [model, setModel] = useState<Model | null>(null);
  const [stats, setStats] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchModelAndStats();
    // Check if already voted
    if (typeof window !== 'undefined') {
      const voted = sessionStorage.getItem('votedModels');
      if (voted) {
        const votedSet = new Set(JSON.parse(voted));
        setHasVoted(votedSet.has(modelId));
      }
    }
  }, [modelId, days]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchModelAndStats = async () => {
    try {
      const [modelRes, statsRes] = await Promise.all([
        fetch(`/api/models/${encodeURIComponent(modelId)}`),
        fetch(`/api/stats/${encodeURIComponent(modelId)}?days=${days}`),
      ]);

      if (!modelRes.ok) {
        setModel(null);
        setLoading(false);
        return;
      }

      const modelData = await modelRes.json();
      const statsData = await statsRes.json();

      setModel(modelData);

      const formattedStats = statsData.historical.map((stat: {
        stat_date: string;
        avg_performance: string;
        avg_speed: string;
        avg_intelligence: string;
        avg_reliability: string;
        total_votes: number;
      }) => ({
        date: stat.stat_date,
        performance: parseFloat(stat.avg_performance) || 0,
        speed: parseFloat(stat.avg_speed) || 0,
        intelligence: parseFloat(stat.avg_intelligence) || 0,
        reliability: parseFloat(stat.avg_reliability) || 0,
        votes: stat.total_votes,
      }));

      // Add today's live data if available
      if (statsData.today && statsData.today.total_votes > 0) {
        formattedStats.push({
          date: new Date().toISOString().split('T')[0],
          performance: parseFloat(statsData.today.avg_performance) || 0,
          speed: parseFloat(statsData.today.avg_speed) || 0,
          intelligence: parseFloat(statsData.today.avg_intelligence) || 0,
          reliability: parseFloat(statsData.today.avg_reliability) || 0,
          votes: statsData.today.total_votes,
        });
      }

      setStats(formattedStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async (vote: Vote) => {
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vote),
      });

      if (res.ok) {
        // Mark model as voted
        setHasVoted(true);
        if (typeof window !== 'undefined') {
          const voted = sessionStorage.getItem('votedModels');
          const votedSet = new Set(voted ? JSON.parse(voted) : []);
          votedSet.add(modelId);
          sessionStorage.setItem('votedModels', JSON.stringify(Array.from(votedSet)));
        }
        
        // Refresh stats to show updated data
        fetchModelAndStats();
        
        // Track vote with Google Analytics
        trackVote(vote.modelId, ((vote.ratings.performance || 0) + (vote.ratings.intelligence || 0)) / 2);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading statistics...</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Model not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header 
        backButtonText="Back to stats"
        backButtonHref="/stats"
        title={model.name}
        subtitle={`${model.provider} • ${model.category || 'LLM'} • ${model.context_length ? model.context_length.toLocaleString() + ' tokens' : ''}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rate Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowVoteModal(true)}
            disabled={hasVoted}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
              hasVoted
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:scale-105"
            )}
          >
            <Star className="w-5 h-5" />
            {hasVoted ? "Already Rated" : "Rate This Model"}
          </button>
        </div>

        <div className="mb-8">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Time Period</h2>
                <p className="text-sm text-muted-foreground mt-1">Select the date range for historical data</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{stats.length} data points</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    days === d
                      ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                      : "bg-muted text-foreground hover:bg-accent"
                  )}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </div>

        {stats.length > 0 ? (
          <StatsChart data={stats} modelName={model.name} />
        ) : (
          <div className="bg-card rounded-xl border p-12 text-center">
            <p className="text-muted-foreground">No statistics available for this period</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Current Metrics
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: 'Performance', icon: TrendingUp, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
              { name: 'Speed', icon: TrendingUp, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
              { name: 'Intelligence', icon: Brain, bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
              { name: 'Reliability', icon: TrendingUp, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' }
            ].map(({ name, icon: Icon, bgColor, iconColor }) => {
              const metric = name.toLowerCase();
              const latestStat = stats[stats.length - 1];
              const rawValue = latestStat ? latestStat[metric as keyof StatsData] : 0;
              const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
              const previousStat = stats[stats.length - 2];
              const rawPreviousValue = previousStat ? previousStat[metric as keyof StatsData] : 0;
              const previousValue = typeof rawPreviousValue === 'number' ? rawPreviousValue : Number(rawPreviousValue);
              const change = value - previousValue;
              const percentChange = previousValue > 0 ? ((change / previousValue) * 100) : 0;

              return (
                <div key={name} className="bg-card rounded-xl border p-5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">{name}</h3>
                    <div className={cn(
                      "p-2 rounded-lg",
                      bgColor
                    )}>
                      <Icon className={cn("w-4 h-4", iconColor)} />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{value.toFixed(2)}</span>
                      <span className={cn("text-xl", getMoodColor(value))}>
                        {getMoodEmoji(value)}
                      </span>
                    </div>
                    {change !== 0 && (
                      <div className="flex items-center gap-1">
                        {change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : change < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <Minus className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {Math.abs(percentChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {latestStat && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{latestStat.votes} votes</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection modelId={modelId} />
        </div>

        {/* Development Credit */}
        <div className="mt-12 text-center pb-8">
          <p className="text-xs text-muted-foreground/70">
            Real-time tracking by{' '}
            <a 
              href="https://fourtwenty.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              FourTwenty Development
            </a>
          </p>
        </div>
      </div>

      {model && (
        <VoteModal
          model={model}
          open={showVoteModal}
          onOpenChange={setShowVoteModal}
          onVoteSubmit={handleVoteSubmit}
        />
      )}
    </main>
  );
}