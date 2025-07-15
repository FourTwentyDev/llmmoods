// Google Analytics helper functions

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Helper to check if analytics should be active
export const isAnalyticsEnabled = () => {
  if (typeof window === 'undefined') return false;
  
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) return false;
  
  try {
    // Handle legacy 'accepted' value
    if (consent === 'accepted') return false;
    
    const preferences = JSON.parse(consent);
    return preferences.analytics === true && !!GA_MEASUREMENT_ID;
  } catch {
    return false;
  }
};

// Log page views
export const pageview = (url: string) => {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url,
  });
};

// Log specific events
export const event = (action: string, parameters?: Record<string, unknown>) => {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  
  window.gtag('event', action, parameters);
};

// Predefined events for the application
export const trackVote = (modelId: string, rating: number) => {
  event('vote_submitted', {
    event_category: 'engagement',
    event_label: modelId,
    value: rating,
  });
};

export const trackModelView = (modelId: string) => {
  event('model_view', {
    event_category: 'engagement',
    event_label: modelId,
  });
};

export const trackCompare = (modelIds: string[]) => {
  event('models_compared', {
    event_category: 'engagement',
    event_label: modelIds.join(','),
    value: modelIds.length,
  });
};

export const trackApiUsage = (endpoint: string) => {
  event('api_usage', {
    event_category: 'api',
    event_label: endpoint,
  });
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  event('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

export const trackFilter = (filterType: string, filterValue: string) => {
  event('filter_applied', {
    event_category: 'engagement',
    filter_type: filterType,
    filter_value: filterValue,
  });
};