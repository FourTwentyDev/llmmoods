import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation - LLM Mood Tracker',
  description: 'Free public API for accessing AI model performance data, rankings, and statistics. RESTful endpoints with JSON responses for developers.',
  keywords: 'LLM API, AI model API, language model API, REST API documentation, AI performance data API, free API, developer API',
  openGraph: {
    title: 'API Documentation - LLM Mood Tracker',
    description: 'Free public API for accessing AI model performance data and statistics',
    url: 'https://llmmood.com/api-docs',
    images: [
      {
        url: '/og-api.png',
        width: 1200,
        height: 630,
        alt: 'LLM Mood Tracker API Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLM Mood Tracker API',
    description: 'Free public API for accessing AI model performance data and statistics',
    images: ['/og-api.png'],
  },
  alternates: {
    canonical: 'https://llmmood.com/api-docs',
  },
};