'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, ArrowLeft, Copy, Check, ChevronRight, Code2, Zap, BookOpen } from 'lucide-react';

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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Brain className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-sm text-gray-600">Free, public API for AI model rankings</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Getting Started</h2>
          </div>
          <p className="text-gray-600 mb-4">
            The LLM Mood Tracker API provides real-time access to community-driven AI model rankings and performance data. 
            No authentication required - just start making requests!
          </p>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
            <span className="text-gray-500">Base URL:</span> {baseUrl}/api/v1
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('rest')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'rest' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            REST Endpoints
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'examples' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Code Examples
          </button>
        </div>

        {activeTab === 'rest' && (
          <>
            {/* Get All Models */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Get All Models</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  GET
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="text-sm">/api/v1/models</code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/models`, 'models')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copiedEndpoint === 'models' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
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
                    <td className="py-2"><code className="text-sm bg-gray-100 px-1 rounded">category</code></td>
                    <td className="py-2 text-gray-600">string</td>
                    <td className="py-2 text-gray-600">Filter by category (llm, image, code)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code className="text-sm bg-gray-100 px-1 rounded">provider</code></td>
                    <td className="py-2 text-gray-600">string</td>
                    <td className="py-2 text-gray-600">Filter by provider (openai, anthropic, etc.)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code className="text-sm bg-gray-100 px-1 rounded">limit</code></td>
                    <td className="py-2 text-gray-600">number</td>
                    <td className="py-2 text-gray-600">Results per page (max: 100, default: 50)</td>
                  </tr>
                  <tr>
                    <td className="py-2"><code className="text-sm bg-gray-100 px-1 rounded">offset</code></td>
                    <td className="py-2 text-gray-600">number</td>
                    <td className="py-2 text-gray-600">Pagination offset (default: 0)</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="font-medium mb-2">Example Response</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Get Single Model</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  GET
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="text-sm">/api/v1/models/{'{modelId}'}</code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/models/{modelId}`, 'model')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copiedEndpoint === 'model' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
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
                    <td className="py-2"><code className="text-sm bg-gray-100 px-1 rounded">modelId</code></td>
                    <td className="py-2 text-gray-600">string</td>
                    <td className="py-2 text-gray-600">The model ID (e.g., "gpt-4", "claude-3-opus")</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Get Rankings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Get Rankings</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  GET
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between">
                <code className="text-sm">/api/v1/rankings</code>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}/api/v1/rankings`, 'rankings')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  {copiedEndpoint === 'rankings' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
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
                    <td className="py-2"><code className="text-sm bg-gray-100 px-1 rounded">period</code></td>
                    <td className="py-2 text-gray-600">string</td>
                    <td className="py-2 text-gray-600">Time period: today, week, month (default: today)</td>
                  </tr>
                  <tr>
                    <td className="py-2"><code className="text-sm bg-gray-100 px-1 rounded">category</code></td>
                    <td className="py-2 text-gray-600">string</td>
                    <td className="py-2 text-gray-600">Filter by category (llm, image, code)</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="font-medium mb-2">Example Response</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">JavaScript / Node.js</h3>
              </div>
              
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Python</h3>
              </div>
              
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
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
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">cURL</h3>
              </div>
              
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
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
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">Rate Limits</h3>
              <p className="text-orange-800">
                The API is free to use with generous rate limits: 1000 requests per hour per IP address. 
                Responses include cache headers for optimal performance. No API key required!
              </p>
            </div>
          </div>
        </div>

        {/* Subtle branding */}
        <div className="text-center mt-12 mb-8">
          <p className="text-xs text-gray-400">
            API powered by{' '}
            <a 
              href="https://fourtwenty.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              FourTwenty Development
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}