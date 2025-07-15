import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Model Statistics & Rankings - LLM Mood Tracker',
  description: 'Explore comprehensive statistics and rankings for AI language models. View daily, weekly, and monthly performance trends, top performers, and voting patterns.',
  keywords: 'AI model statistics, LLM rankings, AI performance trends, language model analytics, GPT-4 stats, Claude performance, model benchmarks',
  openGraph: {
    title: 'AI Model Statistics & Rankings - LLM Mood Tracker',
    description: 'Explore comprehensive statistics and rankings for AI language models',
    url: 'https://llmmood.com/stats',
    images: [
      {
        url: '/og-stats.png',
        width: 1200,
        height: 630,
        alt: 'AI Model Statistics on LLM Mood Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Model Statistics & Rankings',
    description: 'Explore comprehensive statistics and rankings for AI language models',
    images: ['/og-stats.png'],
  },
  alternates: {
    canonical: 'https://llmmood.com/stats',
  },
};