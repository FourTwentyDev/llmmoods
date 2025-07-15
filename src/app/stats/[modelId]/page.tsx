import { Metadata } from 'next';
import { StatsPageClient } from './StatsPageClient';

interface PageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { modelId } = await params;
  const decodedModelId = decodeURIComponent(modelId);
  
  // For now, return generic metadata
  // The actual model data will be fetched on the client side
  return {
    title: `Model Statistics - LLM Mood Tracker`,
    description: `View detailed statistics and performance trends for AI models on LLM Mood Tracker.`,
  };
}

export default async function ModelStatsPage({ params }: PageProps) {
  // Simply render the client component
  // The client component will handle fetching the model data
  return <StatsPageClient />;
}