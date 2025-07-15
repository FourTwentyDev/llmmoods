interface StructuredDataProps {
  type: 'WebSite' | 'SoftwareApplication' | 'FAQPage' | 'BreadcrumbList';
  data: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Predefined structured data for the website
export const websiteStructuredData = {
  name: 'LLM Mood Tracker',
  url: 'https://llmmood.com',
  description: 'Track and compare the daily performance of popular AI language models through community-driven ratings.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://llmmood.com/?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'LLM Mood Tracker',
    url: 'https://llmmood.com',
  },
};

export const faqStructuredData = {
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is LLM Mood Tracker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LLM Mood Tracker is a community-driven platform that tracks and compares the daily performance of popular AI language models like GPT-4, Claude, Gemini, and more.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the rating system work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Users can rate models on performance, intelligence, speed, and reliability on a scale of 1-5. Ratings are aggregated daily to show trends and overall model performance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we use a privacy-first design with fingerprint hashing. We do not store any personal information, making our platform fully GDPR compliant.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use the API?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we provide a free public API for accessing model data, rankings, and statistics. Check our API documentation for endpoints and usage examples.',
      },
    },
  ],
};

export function generateModelStructuredData(model: {
  name: string;
  provider: string;
  votes_today: number;
  current_performance: number;
  current_intelligence: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: model.name,
    applicationCategory: 'AI Language Model',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: model.votes_today > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: ((model.current_performance + model.current_intelligence) / 2).toFixed(2),
      bestRating: '5',
      worstRating: '1',
      ratingCount: model.votes_today,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: model.provider,
    },
  };
}

export function generateBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}