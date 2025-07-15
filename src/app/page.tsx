'use client';

import { useState, useEffect } from 'react';
import { ModelCard } from '@/components/ModelCard';
import { VoteModal } from '@/components/VoteModal';
import { Model, Vote } from '@/types';

interface ModelWithStats extends Model {
  avg_performance?: number;
  avg_intelligence?: number;
  total_votes?: number;
}
import { BarChart3, Github, TrendingUp, TrendingDown, Award, Clock, Zap, ChevronRight, Users, Sparkles, Flame, GitCompare, Code2, Search, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getMoodEmoji, cn } from '@/lib/utils';
import { StructuredData, websiteStructuredData, faqStructuredData } from '@/components/StructuredData';
import { trackVote, trackSearch, trackFilter } from '@/lib/analytics';
import { ThemeToggle } from '@/components/ThemeToggle';
import Header from '@/components/Header';

export default function HomePage() {
  const [models, setModels] = useState<Model[]>([]);
  const [topModels, setTopModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [votedModels, setVotedModels] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'llm' | 'image' | 'code'>('all');
  const [topPerformers, setTopPerformers] = useState<{ today: ModelWithStats[], week: ModelWithStats[], month: ModelWithStats[] }>({ today: [], week: [], month: [] });
  const [hotModels, setHotModels] = useState<Model[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueVendors, setUniqueVendors] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'featured' | 'all'>('featured');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'context'>('newest');
  const modelsPerPage = 12;

  useEffect(() => {
    fetchModels();
    fetchTopPerformers();
    fetchTopModels();
    // Load voted models from sessionStorage
    if (typeof window !== 'undefined') {
      const voted = sessionStorage.getItem('votedModels');
      if (voted) {
        setVotedModels(new Set(JSON.parse(voted)));
      }
    }
  }, [viewMode, filter, selectedVendor, debouncedSearch, sortBy]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
      
      // Track search if query is not empty
      if (searchQuery.trim()) {
        trackSearch(searchQuery, models.length);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchModels = async () => {
    try {
      // Build query params
      const params = new URLSearchParams({
        view: viewMode,
        ...(filter !== 'all' && { category: filter }),
        ...(selectedVendor !== 'all' && { provider: selectedVendor }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(viewMode === 'all' && { sort: sortBy })
      });
      
      const res = await fetch(`/api/models?${params}`);
      const data = await res.json();
      setModels(data.models);
      
      // Only fetch vendor list once or when viewMode changes
      if (uniqueVendors.length === 0 || viewMode) {
        const allModelsRes = await fetch('/api/models?view=all');
        const allModelsData = await allModelsRes.json();
        const vendors = [...new Set(allModelsData.models.map((m: Model) => m.provider))].sort();
        setUniqueVendors(vendors as string[]);
      }
      
      // Calculate hot models (high vote velocity)
      const hot = data.models
        .filter((m: Model) => (m.votes_today || 0) > 5)
        .sort((a: Model, b: Model) => (b.votes_today || 0) - (a.votes_today || 0))
        .slice(0, 4);
      setHotModels(hot);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const [todayRes, weekRes, monthRes] = await Promise.all([
        fetch('/api/stats?period=1'),
        fetch('/api/stats?period=7'),
        fetch('/api/stats?period=30')
      ]);
      
      const [todayData, weekData, monthData] = await Promise.all([
        todayRes.json(),
        weekRes.json(),
        monthRes.json()
      ]);
      
      setTopPerformers({
        today: todayData.topModels?.byPerformance?.slice(0, 3) || [],
        week: weekData.topModels?.byPerformance?.slice(0, 3) || [],
        month: monthData.topModels?.byPerformance?.slice(0, 3) || []
      });
    } catch (error) {
      console.error('Failed to fetch top performers:', error);
    }
  };

  const fetchTopModels = async () => {
    try {
      const res = await fetch('/api/top-models');
      const data = await res.json();
      setTopModels(data.models);
    } catch (error) {
      console.error('Failed to fetch top models:', error);
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
        const newVoted = new Set(votedModels).add(vote.modelId);
        setVotedModels(newVoted);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('votedModels', JSON.stringify(Array.from(newVoted)));
        }
        
        // Refresh models to show updated stats
        fetchModels();
        
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

  // Models are already filtered server-side
  const filteredModels = models;

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * modelsPerPage,
    currentPage * modelsPerPage
  );

  // Create a Set of top model IDs for efficient filtering
  const topModelIds = new Set(topModels.map(m => m.id));
  
  let trendingModels: Model[] = [];

  // Always show trending models (most voted today)
  trendingModels = filteredModels
    .filter(m => !topModelIds.has(m.id)) // Don't duplicate top models
    .sort((a, b) => (b.votes_today || 0) - (a.votes_today || 0))
    .slice(0, 3);

  // Create a Set of trending model IDs for efficient filtering
  const trendingModelIds = new Set(trendingModels.map(m => m.id));

  const otherModels = paginatedModels.filter(
    model => !topModelIds.has(model.id) && !trendingModelIds.has(model.id)
  );

  return (
    <>
      <StructuredData type="WebSite" data={websiteStructuredData} />
      <StructuredData type="FAQPage" data={faqStructuredData} />
      <main className="min-h-screen bg-background">
        <Header showBackButton={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Models by Top Providers - Always visible at the top */}
        {!loading && topModels.length > 0 && filter === 'all' && selectedVendor === 'all' && debouncedSearch === '' && (
          <section className="mb-12">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent max-w-[100px]" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Top Models
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent max-w-[100px]" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Industry-leading AI models from premier providers
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span>Live Performance</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topModels.map((model) => {
                const overallScore = ((model.current_performance || 0) + (model.current_intelligence || 0)) / 2 || 0;
                return (
                  <div
                    key={model.id}
                    className="relative group h-[280px]"
                  >
                    {/* Card container with fixed height */}
                    <div className="relative h-full bg-card rounded-xl border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:shadow-yellow-500/10">
                      {/* Accent stripe at top */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500" />
                      
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(251, 191, 36, 0.1) 10px, rgba(251, 191, 36, 0.1) 20px)`
                        }} />
                      </div>
                      
                      {/* TOP PROVIDER badge */}
                      <div className="absolute top-3 right-3 z-20">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          TOP PROVIDER
                        </div>
                      </div>
                      
                      {/* Provider - absolute positioned at top */}
                      <div className="absolute top-6 left-6 right-6">
                        <p className="text-sm text-muted-foreground">
                          {model.provider}
                        </p>
                      </div>
                      
                      {/* Model name - absolute positioned below provider */}
                      <div className="absolute top-11 left-6 right-6 pr-12">
                        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {model.name.includes(':') ? model.name.split(':').slice(1).join(':').trim() : model.name}
                        </h3>
                      </div>
                      
                      {/* Mood emoji - absolute positioned top right */}
                      <div className="absolute top-12 right-6 text-3xl">
                        {getMoodEmoji(overallScore)}
                      </div>
                      
                      {/* Performance indicator - absolute positioned in middle */}
                      <div className="absolute top-32 left-6 right-6">
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
                      
                      {/* Votes - absolute positioned above buttons */}
                      <div className="absolute bottom-20 left-6 right-6">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-muted-foreground/70" />
                          <span>{model.votes_today || 0} votes today</span>
                        </div>
                      </div>
                      
                      {/* Action buttons - absolute positioned at bottom */}
                      <div className="absolute bottom-6 left-6 right-6 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModel(model);
                          }}
                          disabled={votedModels.has(model.id)}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg font-medium transition-all",
                            votedModels.has(model.id)
                              ? "bg-secondary text-muted-foreground cursor-not-allowed"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          {votedModels.has(model.id) ? 'Already voted' : 'Rate'}
                        </button>
                        <Link
                          href={`/stats/${encodeURIComponent(model.id)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all flex items-center justify-center"
                          title="View statistics"
                        >
                          <BarChart3 className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/compare?models=${model.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all flex items-center justify-center"
                          title="Compare with other models"
                        >
                          <GitCompare className="w-5 h-5" />
                        </Link>
                      </div>
                      
                      {/* Invisible link overlay for clicking anywhere on card */}
                      <Link
                        href={`/stats/${encodeURIComponent(model.id)}`}
                        className="absolute inset-0 z-10"
                        aria-label={`View stats for ${model.name}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Hot Models Section - Eye-catching for Rabbit Hole Entry */}
        {hotModels.length > 0 && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Hot Right Now</h2>
                    <p className="text-orange-100">Models everyone&apos;s talking about today</p>
                  </div>
                </div>
                <Link 
                  href="/stats" 
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur"
                >
                  <span>View All Stats</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {hotModels.map((model) => (
                  <Link
                    key={model.id}
                    href={`/stats/${encodeURIComponent(model.id)}`}
                    className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{model.name}</h3>
                        <p className="text-sm text-orange-100">{model.provider}</p>
                      </div>
                      <span className="text-2xl">
                        {getMoodEmoji(((model.current_performance || 0) + (model.current_intelligence || 0)) / 2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{model.votes_today} votes today</span>
                      <Zap className="w-4 h-4 ml-auto text-yellow-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Top Performers Carousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Award className="w-7 h-7 text-yellow-500" />
              Top Performers
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today's Top */}
            <div className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Today</h3>
              </div>
              <div className="space-y-3">
                {topPerformers.today.map((model, index) => (
                  <Link
                    key={model.id}
                    href={`/stats/${encodeURIComponent(model.id)}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-lg font-bold",
                        index === 0 ? "text-yellow-500" : index === 1 ? "text-muted-foreground" : "text-amber-600"
                      )}>
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium line-clamp-1">{model.name}</p>
                        <p className="text-sm text-muted-foreground">{model.avg_performance?.toFixed(2) || 0}/5.00</p>
                      </div>
                    </div>
                    <span className="text-xl">
                      {getMoodEmoji(model.avg_performance || 0)}
                    </span>
                  </Link>
                ))}
              </div>
              <Link 
                href="/stats?period=1" 
                className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <span>View all today&apos;s rankings</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* This Week's Top */}
            <div className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-lg">This Week</h3>
              </div>
              <div className="space-y-3">
                {topPerformers.week.map((model, index) => (
                  <Link
                    key={model.id}
                    href={`/stats/${encodeURIComponent(model.id)}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-lg font-bold",
                        index === 0 ? "text-yellow-500" : index === 1 ? "text-muted-foreground" : "text-amber-600"
                      )}>
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium line-clamp-1">{model.name}</p>
                        <p className="text-sm text-muted-foreground">{model.avg_performance?.toFixed(2) || 0}/5.00</p>
                      </div>
                    </div>
                    <span className="text-xl">
                      {getMoodEmoji(model.avg_performance || 0)}
                    </span>
                  </Link>
                ))}
              </div>
              <Link 
                href="/stats?period=7" 
                className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-700"
              >
                <span>View weekly rankings</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* This Month's Top */}
            <div className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-lg">This Month</h3>
              </div>
              <div className="space-y-3">
                {topPerformers.month.map((model, index) => (
                  <Link
                    key={model.id}
                    href={`/stats/${encodeURIComponent(model.id)}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-lg font-bold",
                        index === 0 ? "text-yellow-500" : index === 1 ? "text-muted-foreground" : "text-amber-600"
                      )}>
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium line-clamp-1">{model.name}</p>
                        <p className="text-sm text-muted-foreground">{model.avg_performance?.toFixed(2) || 0}/5.00</p>
                      </div>
                    </div>
                    <span className="text-xl">
                      {getMoodEmoji(model.avg_performance || 0)}
                    </span>
                  </Link>
                ))}
              </div>
              <Link 
                href="/stats?period=30" 
                className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <span>View monthly rankings</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="bg-card rounded-xl border p-6">
            {/* Search Bar and View Mode Toggle */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search models by name or provider..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      // Auto-switch to "All Models" when searching
                      if (e.target.value.trim() && viewMode === 'featured') {
                        setViewMode('all');
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('featured')}
                    className={cn(
                      "px-4 py-2 rounded-md font-medium transition-all",
                      viewMode === 'featured'
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Latest Models
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={cn(
                      "px-4 py-2 rounded-md font-medium transition-all",
                      viewMode === 'all'
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All Models
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <div className="flex items-center gap-2">
                  {(['all', 'llm', 'image', 'code'] as const).map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilter(category);
                        setCurrentPage(1);
                        trackFilter('category', category);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all",
                        filter === category
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {category === 'all' ? 'All' : category.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Vendor Filter */}
              <div className="sm:w-64">
                <label className="block text-sm font-medium text-foreground mb-2">Provider</label>
                <select
                  value={selectedVendor}
                  onChange={(e) => {
                    setSelectedVendor(e.target.value);
                    setCurrentPage(1);
                    trackFilter('vendor', e.target.value);
                    // Auto-switch to "All Models" when selecting a provider
                    if (e.target.value !== 'all' && viewMode === 'featured') {
                      setViewMode('all');
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">All Providers</option>
                  {uniqueVendors.map(vendor => (
                    <option key={vendor} value={vendor}>
                      {vendor.charAt(0).toUpperCase() + vendor.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort Filter - Only visible in "All Models" view */}
              {viewMode === 'all' && (
                <div className="sm:w-48">
                  <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as 'newest' | 'oldest' | 'context');
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="context">Context Length</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* Results Count */}
            {debouncedSearch && (
              <div className="mt-4 text-sm text-muted-foreground">
                Found {filteredModels.length} models matching &quot;{debouncedSearch}&quot;
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading models...</div>
          </div>
        ) : (
          <>

            {/* Trending Today Section */}
            {trendingModels.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  Trending Today
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trendingModels.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      onVoteClick={() => setSelectedModel(model)}
                      hasVoted={votedModels.has(model.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {otherModels.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  All Models
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {otherModels.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      onVoteClick={() => setSelectedModel(model)}
                      hasVoted={votedModels.has(model.id)}
                    />
                  ))}
                </div>
              </section>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    currentPage === 1
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "px-3 py-1 rounded-lg transition-colors",
                            page === currentPage
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent"
                          )}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-1 text-muted-foreground">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    currentPage === totalPages
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Development Credit */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground/60">
            Developed by{' '}
            <a 
              href="https://fourtwenty.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              FourTwenty Development
            </a>
            {' '}- Professional Web Solutions
          </p>
        </div>
      </div>

      {selectedModel && (
        <VoteModal
          model={selectedModel}
          open={!!selectedModel}
          onOpenChange={(open) => !open && setSelectedModel(null)}
          onVoteSubmit={handleVoteSubmit}
        />
      )}
      </main>
    </>
  );
}