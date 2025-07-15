'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StatsChart } from '@/components/StatsChart';
import { Model } from '@/types';
import { Brain, ArrowLeft, TrendingUp, TrendingDown, Minus, Users, Calendar, Sparkles } from 'lucide-react';
import { getMoodEmoji, getMoodColor, cn } from '@/lib/utils';

interface StatsData {
  date: string;
  performance: number;
  speed: number;
  intelligence: number;
  reliability: number;
  votes: number;
}

export default function ModelStatsPage() {
  const params = useParams();
  const modelId = decodeURIComponent(params.modelId as string);
  const [model, setModel] = useState<Model | null>(null);
  const [stats, setStats] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchModelAndStats();
  }, [modelId, days]);

  const fetchModelAndStats = async () => {
    try {
      const [modelsRes, statsRes] = await Promise.all([
        fetch('/api/models'),
        fetch(`/api/stats/${encodeURIComponent(modelId)}?days=${days}`),
      ]);

      const modelsData = await modelsRes.json();
      const statsData = await statsRes.json();

      const currentModel = modelsData.models.find((m: Model) => m.id === modelId);
      setModel(currentModel);

      const formattedStats = statsData.historical.map((stat: any) => ({
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Model not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-white/50 rounded-lg transition-colors mt-1"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-8 h-8 text-blue-500" />
                  <h1 className="text-3xl font-bold text-gray-900">{model.name}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-white rounded-full shadow-sm">
                    {model.provider}
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full shadow-sm capitalize">
                    {model.category || 'LLM'}
                  </span>
                  {model.context_length && (
                    <span className="px-3 py-1 bg-white rounded-full shadow-sm">
                      {model.context_length.toLocaleString()} tokens
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-1">
                {getMoodEmoji((model.current_performance + model.current_intelligence) / 2 || 0)}
              </div>
              <p className="text-sm text-gray-600">Current Mood</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Time Period</h2>
                <p className="text-sm text-gray-500 mt-1">Select the date range for historical data</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                      ? "bg-blue-500 text-white shadow-md transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No statistics available for this period</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Current Metrics
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: 'Performance', icon: TrendingUp, color: 'blue' },
              { name: 'Speed', icon: TrendingUp, color: 'green' },
              { name: 'Intelligence', icon: Brain, color: 'purple' },
              { name: 'Reliability', icon: TrendingUp, color: 'amber' }
            ].map(({ name, icon: Icon, color }) => {
              const metric = name.toLowerCase();
              const latestStat = stats[stats.length - 1];
              const value = latestStat ? latestStat[metric as keyof StatsData] : 0;
              const previousStat = stats[stats.length - 2];
              const previousValue = previousStat ? previousStat[metric as keyof StatsData] : 0;
              const change = value - previousValue;
              const percentChange = previousValue > 0 ? ((change / previousValue) * 100) : 0;

              return (
                <div key={name} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-600">{name}</h3>
                    <div className={cn(
                      "p-2 rounded-lg",
                      `bg-${color}-50`
                    )}>
                      <Icon className={cn("w-4 h-4", `text-${color}-600`)} />
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
                          <Minus className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-400"
                        )}>
                          {Math.abs(percentChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {latestStat && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{latestStat.votes} votes</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}