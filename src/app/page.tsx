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
import { BarChart3, Github, TrendingUp, Award, Clock, Zap, ChevronRight, Users, Sparkles, Flame, GitCompare, Code2, Search, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getMoodEmoji, cn } from '@/lib/utils';
import { StructuredData, websiteStructuredData, faqStructuredData } from '@/components/StructuredData';
import { trackVote, trackSearch, trackFilter } from '@/lib/analytics';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  const [models, setModels] = useState<Model[]>([]);
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
  const modelsPerPage = 12;

  useEffect(() => {
    fetchModels();
    fetchTopPerformers();
    // Load voted models from sessionStorage
    if (typeof window !== 'undefined') {
      const voted = sessionStorage.getItem('votedModels');
      if (voted) {
        setVotedModels(new Set(JSON.parse(voted)));
      }
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
      
      // Track search if query is not empty
      if (searchQuery.trim()) {
        const results = models.filter(model => 
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.provider.toLowerCase().includes(searchQuery.toLowerCase())
        );
        trackSearch(searchQuery, results.length);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, models]);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data.models);
      
      // Extract unique vendors
      const vendors = [...new Set(data.models.map((m: Model) => m.provider))].sort();
      setUniqueVendors(vendors as string[]);
      
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

  const filteredModels = models.filter(model => {
    const matchesCategory = filter === 'all' || model.category === filter;
    const matchesVendor = selectedVendor === 'all' || model.provider === selectedVendor;
    const matchesSearch = debouncedSearch === '' || 
      model.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      model.provider.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    return matchesCategory && matchesVendor && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * modelsPerPage,
    currentPage * modelsPerPage
  );

  const popularModels = filteredModels
    .sort((a, b) => (b.votes_today || 0) - (a.votes_today || 0))
    .slice(0, 3);

  const otherModels = paginatedModels.filter(
    model => !popularModels.includes(model)
  );

  return (
    <>
      <StructuredData type="WebSite" data={websiteStructuredData} />
      <StructuredData type="FAQPage" data={faqStructuredData} />
      <main className="min-h-screen bg-background">
        <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.webp" 
                alt="LLM Mood Tracker Logo" 
                width={64} 
                height={64} 
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">LLM Mood Tracker</h1>
                <p className="text-sm text-muted-foreground">How&apos;s your AI feeling today?</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/compare"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <GitCompare className="w-5 h-5" />
                <span className="hidden sm:inline">Compare</span>
              </Link>
              <Link
                href="/stats"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Stats</span>
              </Link>
              <Link href="/api-docs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Code2 className="w-5 h-5" />
                <span className="hidden sm:inline">API</span>
              </Link>
              <a
                href="https://github.com/FourTwentyDev/llmmoods"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Github className="w-5 h-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search models by name or provider..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                />
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
            {popularModels.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Trending Today
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {popularModels.map((model) => (
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