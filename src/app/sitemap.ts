import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://llmmood.com';
  
  // In production, fetch all active models from database
  // For now, using common models
  const modelIds = [
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3-5-sonnet',
    'claude-3-5-haiku',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'llama-3.1-70b',
    'deepseek-v3',
  ];

  const modelUrls = modelIds.map((id) => ({
    url: `${baseUrl}/models/${id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const statsUrls = modelIds.map((id) => ({
    url: `${baseUrl}/stats/${id}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...modelUrls,
    ...statsUrls,
  ];
}