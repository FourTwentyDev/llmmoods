'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Model } from '@/types';
import { Brain, ArrowLeft, Plus, X, TrendingUp, Zap, Award, Shield, Share2, Twitter, Link2 } from 'lucide-react';
import { getMoodEmoji, getMoodColor, cn } from '@/lib/utils';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchModels();
    
    // Load models from URL params
    const modelIds = searchParams.get('models')?.split(',') || [];
    if (modelIds.length > 0) {
      loadModelsFromIds(modelIds);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedModels.length > 0) {
      fetchCompareData();
    }
  }, [selectedModels]);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data.models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModelsFromIds = async (modelIds: string[]) => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      const selected = data.models.filter((m: Model) => modelIds.includes(m.id));
      setSelectedModels(selected);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const fetchCompareData = async () => {
    try {
      const promises = selectedModels.map(model =>
        fetch(`/api/stats/${encodeURIComponent(model.id)}?days=30`)
          .then(res => res.json())
          .then(data => ({
            modelId: model.id,
            modelName: model.name,
            data: data.historical || []
          }))
      );
      
      const results = await Promise.all(promises);
      
      // Merge data by date
      const dateMap = new Map();
      results.forEach(result => {
        result.data.forEach((stat: any) => {
          const date = stat.stat_date;
          if (!dateMap.has(date)) {
            dateMap.set(date, { date });
          }
          const entry = dateMap.get(date);
          entry[`${result.modelName}_performance`] = parseFloat(stat.avg_performance) || 0;
          entry[`${result.modelName}_intelligence`] = parseFloat(stat.avg_intelligence) || 0;
        });
      });
      
      const mergedData = Array.from(dateMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setCompareData(mergedData);
    } catch (error) {
      console.error('Failed to fetch compare data:', error);
    }
  };

  const addModel = (model: Model) => {
    if (selectedModels.length < 4 && !selectedModels.find(m => m.id === model.id)) {
      const newSelected = [...selectedModels, model];
      setSelectedModels(newSelected);
      
      // Update URL
      const modelIds = newSelected.map(m => m.id).join(',');
      window.history.pushState({}, '', `/compare?models=${modelIds}`);
    }
    setShowModelPicker(false);
    setSearchQuery('');
  };

  const removeModel = (modelId: string) => {
    const newSelected = selectedModels.filter(m => m.id !== modelId);
    setSelectedModels(newSelected);
    
    // Update URL
    if (newSelected.length > 0) {
      const modelIds = newSelected.map(m => m.id).join(',');
      window.history.pushState({}, '', `/compare?models=${modelIds}`);
    } else {
      window.history.pushState({}, '', '/compare');
    }
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const shareOnTwitter = () => {
    const modelNames = selectedModels.map(m => m.name).join(' vs ');
    const text = `Comparing AI models: ${modelNames} on LLM Mood Tracker`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Brain className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compare Models</h1>
                <p className="text-sm text-gray-600">Compare up to 4 models side by side</p>
              </div>
            </div>
            {selectedModels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={shareOnTwitter}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Twitter className="w-4 h-4" />
                      Share on Twitter
                    </button>
                    <button
                      onClick={copyLink}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t"
                    >
                      <Link2 className="w-4 h-4" />
                      {copiedLink ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Model Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Selected Models</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {selectedModels.map((model, index) => (
              <div
                key={model.id}
                className="relative p-4 rounded-lg border-2"
                style={{ borderColor: colors[index] }}
              >
                <button
                  onClick={() => removeModel(model.id)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="font-medium line-clamp-1">{model.name}</h3>
                <p className="text-sm text-gray-500">{model.provider}</p>
                <div className="mt-2 text-2xl">
                  {getMoodEmoji((parseFloat(model.current_performance) + parseFloat(model.current_intelligence)) / 2 || 0)}
                </div>
              </div>
            ))}
            {selectedModels.length < 4 && (
              <button
                onClick={() => setShowModelPicker(true)}
                className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">Add Model</span>
              </button>
            )}
          </div>
        </div>

        {/* Comparison Chart */}
        {selectedModels.length > 0 && compareData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Performance Comparison</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={compareData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  {selectedModels.map((model, index) => (
                    <Line
                      key={model.id}
                      type="monotone"
                      dataKey={`${model.name}_performance`}
                      stroke={colors[index]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={model.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Metrics Comparison */}
        {selectedModels.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Current Metrics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3">Model</th>
                    <th className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Performance
                      </div>
                    </th>
                    <th className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Brain className="w-4 h-4" />
                        Intelligence
                      </div>
                    </th>
                    <th className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4" />
                        Speed
                      </div>
                    </th>
                    <th className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Shield className="w-4 h-4" />
                        Reliability
                      </div>
                    </th>
                    <th className="text-center p-3">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedModels.map((model, index) => {
                    const overall = (parseFloat(model.current_performance) + parseFloat(model.current_intelligence)) / 2 || 0;
                    return (
                      <tr key={model.id} className="border-t">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{model.name}</p>
                            <p className="text-sm text-gray-500">{model.provider}</p>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <span className="text-lg font-semibold">
                            {model.current_performance != null ? parseFloat(model.current_performance).toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <span className="text-lg font-semibold">
                            {model.current_intelligence != null ? parseFloat(model.current_intelligence).toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <span className="text-lg font-semibold">-</span>
                        </td>
                        <td className="text-center p-3">
                          <span className="text-lg font-semibold">-</span>
                        </td>
                        <td className="text-center p-3">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-semibold">
                              {overall.toFixed(2)}
                            </span>
                            <span className="text-2xl">
                              {getMoodEmoji(overall)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Model Picker Modal */}
        {showModelPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Select a Model</h3>
                <button
                  onClick={() => {
                    setShowModelPicker(false);
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                autoFocus
              />
              <div className="overflow-y-auto max-h-[50vh]">
                <div className="grid gap-2">
                  {filteredModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => addModel(model)}
                      disabled={selectedModels.find(m => m.id === model.id) !== undefined}
                      className={cn(
                        "p-3 rounded-lg text-left hover:bg-gray-50 transition-colors",
                        selectedModels.find(m => m.id === model.id) 
                          ? "opacity-50 cursor-not-allowed" 
                          : ""
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-sm text-gray-500">{model.provider}</p>
                        </div>
                        <span className="text-xl">
                          {getMoodEmoji((parseFloat(model.current_performance) + parseFloat(model.current_intelligence)) / 2 || 0)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}