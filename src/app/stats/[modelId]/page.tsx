import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatsPageClient } from './StatsPageClient';

interface PageProps {
  params: Promise<{
    modelId: string;
  }>;
}

async function getModel(modelId: string) {
  try {
    // Fetch model data - this will be cached by Next.js
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/models`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    const decodedModelId = decodeURIComponent(modelId);
    return data.models.find((m: any) => m.id === decodedModelId);
  } catch (error) {
    console.error('Error fetching model:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { modelId } = await params;
  const model = await getModel(modelId);
  
  if (!model) {
    return {
      title: 'Model Not Found - LLM Mood Tracker',
      description: 'The requested AI model could not be found.'
    };
  }

  const title = `${model.name} Statistics & Performance - LLM Mood Tracker`;
  const description = `View detailed statistics and performance trends for ${model.name} by ${model.provider}. Community ratings for speed, intelligence, reliability, and overall performance. ${model.context_length ? `Context: ${model.context_length.toLocaleString()} tokens.` : ''}`;
  
  const url = `https://llmmood.com/stats/${encodeURIComponent(model.id)}`;
  
  return {
    title,
    description,
    keywords: `${model.name}, ${model.provider}, AI model statistics, LLM performance, ${model.name} ratings, ${model.name} benchmarks, ${model.category || 'language model'} performance`,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'LLM Mood Tracker',
      images: [
        {
          url: '/og-stats.png', // You might want to generate dynamic OG images in the future
          width: 1200,
          height: 630,
          alt: `${model.name} Statistics on LLM Mood Tracker`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${model.name} Statistics & Performance`,
      description: `View detailed performance trends for ${model.name} by ${model.provider} on LLM Mood Tracker`,
      images: ['/og-stats.png'],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function ModelStatsPage({ params }: PageProps) {
  // Verify the model exists
  const { modelId } = await params;
  const model = await getModel(modelId);
  
  if (!model) {
    notFound();
  }

  // Render the client component
  return <StatsPageClient />;
}