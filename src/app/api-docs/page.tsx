'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, ArrowLeft, Copy, Check, Code2, Zap, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rest' | 'examples'>('rest');

  const copyToClipboard = async (text: string, endpoint: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(endpoint);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const baseUrl = 'https://llmmood.com';

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-accent rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">API Documentation</h1>
                <p className="text-sm text-muted-foreground">Free, public API for AI model rankings</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-card rounded-xl border p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Getting Started</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            The LLM Mood Tracker API provides real-time access to community-driven AI model rankings and performance data. 
            No authentication required - just start making requests!
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm">
            <span className="text-muted-foreground">Base URL:</span> {baseUrl}/api/v1
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('rest')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'rest' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border text-foreground hover:bg-accent'
            }`}
          >
            REST Endpoints
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'examples' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border text-foreground hover:bg-accent'
            }`}
          >
            Code Examples
          </button>
        </div>

        {activeTab === 'rest' && (
          <>
            {/* Get All Models */}
            <div className="bg-card rounded-xl border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Get All Models</h3>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                  GET
                </span>
              </div>
              
              <div className="bg-muted rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="text-sm">/api/v1/models</code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/models`, 'models')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {copiedEndpoint === 'models' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <h4 className="font-medium mb-2">Query Parameters</h4>
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Parameter</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2"><code className="text-sm bg-muted px-1 rounded">category</code></td>
                    <td className="py-2 text-muted-foreground">string</td>
                    <td className="py-2 text-muted-foreground">Filter by category (llm, image, code)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code className="text-sm bg-muted px-1 rounded">provider</code></td>
                    <td className="py-2 text-muted-foreground">string</td>
                    <td className="py-2 text-muted-foreground">Filter by provider (openai, anthropic, etc.)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code className="text-sm bg-muted px-1 rounded">limit</code></td>
                    <td className="py-2 text-muted-foreground">number</td>
                    <td className="py-2 text-muted-foreground">Results per page (max: 100, default: 50)</td>
                  </tr>
                  <tr>
                    <td className="py-2"><code className="text-sm bg-muted px-1 rounded">offset</code></td>
                    <td className="py-2 text-muted-foreground">number</td>
                    <td className="py-2 text-muted-foreground">Pagination offset (default: 0)</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="font-medium mb-2">Example Response</h4>
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "openai",
      "category": "llm",
      "context_length": 8192,
      "current_performance": "4.5",
      "current_intelligence": "4.7",
      "total_votes": 1523,
      "overall_score": 4.6,
      "updated_at": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 134,
    "hasMore": true
  }
}`}</pre>
            </div>

            {/* Get Single Model */}
            <div className="bg-card rounded-xl border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Get Single Model</h3>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                  GET
                </span>
              </div>
              
              <div className="bg-muted rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="text-sm">/api/v1/models/{'{modelId}'}</code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/models/{modelId}`, 'model')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {copiedEndpoint === 'model' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <h4 className="font-medium mb-2">Path Parameters</h4>
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Parameter</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2"><code className="text-sm bg-muted px-1 rounded">modelId</code></td>
                    <td className="py-2 text-muted-foreground">string</td>
                    <td className="py-2 text-muted-foreground">The model ID (e.g., &quot;gpt-4&quot;, &quot;claude-3-opus&quot;)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Get Rankings */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Get Rankings</h3>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                  GET
                </span>
              </div>
              
              <div className="bg-muted rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="text-sm">/api/v1/rankings</code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/rankings`, 'rankings')}
                  className="p-2 hover:bg-accent rounded transition-colors"
                >
                  {copiedEndpoint === 'rankings' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <h4 className="font-medium mb-2">Query Parameters</h4>
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Parameter</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2"><code className="text-sm bg-muted px-1 rounded">period</code></td>
                    <td className="py-2 text-muted-foreground">string</td>
                    <td className="py-2 text-muted-foreground">Time period: today, week, month (default: today)</td>
                  </tr>
                  <tr>
                    <td className="py-2"><code className="text-sm bg-muted px-1 rounded">category</code></td>
                    <td className="py-2 text-muted-foreground">string</td>
                    <td className="py-2 text-muted-foreground">Filter by category (llm, image, code)</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="font-medium mb-2">Example Response</h4>
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "period": "today",
  "rankings": [
    {
      "id": "claude-3-opus",
      "name": "Claude 3 Opus",
      "provider": "anthropic",
      "category": "llm",
      "avg_performance": "4.8",
      "avg_intelligence": "4.9",
      "vote_count": 234,
      "overall_score": 4.85
    }
  ]
}`}</pre>
            </div>
          </>
        )}

        {activeTab === 'examples' && (
          <>
            {/* JavaScript Example */}
            <div className="bg-card rounded-xl border p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">JavaScript / Node.js</h3>
              </div>
              
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Fetch top models
async function getTopModels() {
  const response = await fetch('${baseUrl}/api/v1/models?limit=10');
  const data = await response.json();
  return data.models;
}

// Get today's rankings
async function getTodayRankings() {
  const response = await fetch('${baseUrl}/api/v1/rankings?period=today');
  const data = await response.json();
  return data.rankings;
}

// Get specific model details
async function getModelDetails(modelId) {
  const response = await fetch(\`${baseUrl}/api/v1/models/\${modelId}\`);
  const data = await response.json();
  return data;
}`}</pre>
            </div>

            {/* Python Example */}
            <div className="bg-card rounded-xl border p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Python</h3>
              </div>
              
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import requests

# Fetch top models
def get_top_models():
    response = requests.get('${baseUrl}/api/v1/models?limit=10')
    return response.json()['models']

# Get weekly rankings for LLMs
def get_weekly_llm_rankings():
    params = {'period': 'week', 'category': 'llm'}
    response = requests.get('${baseUrl}/api/v1/rankings', params=params)
    return response.json()['rankings']

# Compare multiple models
def compare_models(model_ids):
    models = []
    for model_id in model_ids:
        response = requests.get(f'${baseUrl}/api/v1/models/{model_id}')
        models.append(response.json())
    return models`}</pre>
            </div>

            {/* cURL Example */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">cURL</h3>
              </div>
              
              <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
{`# Get all models
curl "${baseUrl}/api/v1/models"

# Get models with pagination
curl "${baseUrl}/api/v1/models?limit=20&offset=20"

# Get today's top performers
curl "${baseUrl}/api/v1/rankings?period=today"

# Get specific model
curl "${baseUrl}/api/v1/models/gpt-4"`}</pre>
            </div>
          </>
        )}

        {/* Rate Limits */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Rate Limits</h3>
              <p className="text-orange-700 dark:text-orange-300">
                The API is free to use with generous rate limits: 1000 requests per hour per IP address. 
                Responses include cache headers for optimal performance. No API key required!
              </p>
            </div>
          </div>
        </div>

        {/* Subtle branding */}
        <div className="text-center mt-12 mb-8">
          <p className="text-xs text-muted-foreground/60">
            API powered by{' '}
            <a 
              href="https://fourtwenty.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              FourTwenty Development
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}