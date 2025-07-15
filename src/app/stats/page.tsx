'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, TrendingUp, Users, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getMoodEmoji, getMoodColor, cn } from '@/lib/utils';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ModelStat {
  id: string;
  name: string;
  provider: string;
  avg_performance: number;
  avg_intelligence: number;
  total_votes: number;
  trend: number;
}

interface StatsData {
  aggregateStats: {
    total_models: number;
    models_with_votes: number;
    total_votes: number;
    avg_performance: number;
    avg_intelligence: number;
  };
  summary: {
    totalVotes: number;
    activeModels: number;
    topProvider: string;
    avgRating: number;
  };
  trends: Array<{
    date: string;
    votes: number;
    avg_rating: number;
  }>;
  topModels: {
    byPerformance: ModelStat[];
    byIntelligence: ModelStat[];
    byVotes: ModelStat[];
    trending: Array<ModelStat & { votes_today: number; vote_growth?: number }>;
  };
  providerStats: Array<{
    provider: string;
    model_count: number;
    total_votes: number;
    avg_rating: number;
  }>;
  byProvider: Array<{
    provider: string;
    modelCount: number;
    modelsWithVotes: number;
    totalVotes: number;
    avgPerformance: number;
  }>;
  byCategory: Array<{
    category: string;
    modelCount: number;
    totalVotes: number;
    avgPerformance: number;
  }>;
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats?period=${period}`);
      const statsData = await res.json();
      setData(statsData);
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Failed to load statistics</div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">Overall Statistics</h1>
            </div>
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to voting
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="mb-8 flex items-center gap-2">
          <span className="text-sm text-gray-600">Time range:</span>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                period === d
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              )}
            >
              {d} days
            </button>
          ))}
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Brain className="w-4 h-4" />
              <h3 className="text-sm font-medium">Total Models</h3>
            </div>
            <p className="text-2xl font-semibold">{data.aggregateStats.total_models}</p>
            <p className="text-sm text-gray-500 mt-1">
              {data.aggregateStats.models_with_votes} with votes
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Users className="w-4 h-4" />
              <h3 className="text-sm font-medium">Total Votes</h3>
            </div>
            <p className="text-2xl font-semibold">{data.aggregateStats.total_votes.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">in last {period} days</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Award className="w-4 h-4" />
              <h3 className="text-sm font-medium">Avg Performance</h3>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">
                {(data.aggregateStats.avg_performance || 0).toFixed(2)}
              </p>
              <span className={cn("text-2xl", getMoodColor(data.aggregateStats.avg_performance || 0))}>
                {getMoodEmoji(data.aggregateStats.avg_performance || 0)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Brain className="w-4 h-4" />
              <h3 className="text-sm font-medium">Avg Intelligence</h3>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">
                {(data.aggregateStats.avg_intelligence || 0).toFixed(2)}
              </p>
              <span className={cn("text-2xl", getMoodColor(data.aggregateStats.avg_intelligence || 0))}>
                {getMoodEmoji(data.aggregateStats.avg_intelligence || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Voting Trends Chart */}
        {data.trends.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Voting Activity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalVotes" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    name="Total Votes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="modelsVoted" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                    name="Models Voted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Models Grid */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Top Performing Models */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Top Performing Models</h2>
            <div className="space-y-3">
              {data.topModels.byPerformance.slice(0, 5).map((model, index) => (
                <Link
                  key={model.id}
                  href={`/stats/${encodeURIComponent(model.id)}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-gray-400 w-6">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-gray-500">{model.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {(model.avg_performance || 0).toFixed(2)}
                    </span>
                    <span className={cn("text-xl", getMoodColor(model.avg_performance || 0))}>
                      {getMoodEmoji(model.avg_performance || 0)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Most Voted Models */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Most Voted Models</h2>
            <div className="space-y-3">
              {data.topModels.byVotes.slice(0, 5).map((model, index) => (
                <Link
                  key={model.id}
                  href={`/stats/${encodeURIComponent(model.id)}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-gray-400 w-6">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-gray-500">{model.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {model.total_votes.toLocaleString()} votes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Models */}
        {data.topModels.trending.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Trending Today
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.topModels.trending.map((model) => (
                <Link
                  key={model.id}
                  href={`/stats/${encodeURIComponent(model.id)}`}
                  className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <h3 className="font-medium mb-1">{model.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{model.provider}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{model.votes_today} today</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {(model.vote_growth || 0) > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        (model.vote_growth || 0) > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {(model.vote_growth || 0) > 0 ? '+' : ''}{model.vote_growth || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats by Provider */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Statistics by Provider</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byProvider}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="provider" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="totalVotes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {data.byProvider.slice(0, 6).map((provider) => (
              <div key={provider.provider} className="p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-2">{provider.provider}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    {provider.modelCount} models ({provider.modelsWithVotes} with votes)
                  </p>
                  <p className="text-gray-600">{provider.totalVotes.toLocaleString()} total votes</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-600">Avg Performance:</span>
                    <span className="font-medium">{provider.avgPerformance.toFixed(2)}</span>
                    <span className={cn("text-lg", getMoodColor(provider.avgPerformance))}>
                      {getMoodEmoji(provider.avgPerformance)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Statistics by Category</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.byCategory.map((category) => (
              <div key={category.category} className="p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-2 capitalize">{category.category || 'Uncategorized'}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    {category.modelCount} models
                  </p>
                  <p className="text-gray-600">{category.totalVotes.toLocaleString()} votes</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-600">Performance:</span>
                    <span className="font-medium">{category.avgPerformance.toFixed(2)}</span>
                    <span className={cn("text-lg", getMoodColor(category.avgPerformance))}>
                      {getMoodEmoji(category.avgPerformance)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Development Credit */}
        <div className="mt-12 text-center pb-8">
          <p className="text-xs text-gray-400">
            Analytics powered by{' '}
            <a 
              href="https://fourtwenty.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors underline-offset-2 hover:underline"
            >
              FourTwenty Development
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}