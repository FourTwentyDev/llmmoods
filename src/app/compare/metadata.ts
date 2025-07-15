import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare AI Models - LLM Mood Tracker',
  description: 'Compare performance metrics of multiple AI language models side by side. Track historical performance trends and current ratings for GPT-4, Claude, Gemini and more.',
  keywords: 'AI model comparison, LLM comparison, GPT-4 vs Claude, AI performance metrics, language model benchmarks, compare AI models',
  openGraph: {
    title: 'Compare AI Models - LLM Mood Tracker',
    description: 'Compare performance metrics of multiple AI language models side by side',
    url: 'https://llmmood.com/compare',
    images: [
      {
        url: '/og-compare.png',
        width: 1200,
        height: 630,
        alt: 'Compare AI Models on LLM Mood Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare AI Models',
    description: 'Compare performance metrics of multiple AI language models side by side',
    images: ['/og-compare.png'],
  },
  alternates: {
    canonical: 'https://llmmood.com/compare',
  },
};