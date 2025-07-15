export interface Model {
  id: string;
  name: string;
  provider: string;
  category: 'llm' | 'image' | 'code' | 'audio' | 'video';
  context_length?: number;
  is_active: boolean;
  current_performance?: number;
  current_intelligence?: number;
  votes_today?: number;
}

export interface Vote {
  modelId: string;
  ratings: {
    performance?: 1 | 2 | 3 | 4;
    speed?: 1 | 2 | 3 | 4 | 5;
    intelligence?: 1 | 2 | 3 | 4 | 5;
    reliability?: 1 | 2 | 3 | 4;
  };
  issueType?: 'hallucination' | 'refused' | 'off-topic' | 'slow' | 'error' | 'other';
}

export interface DailyStats {
  date: string;
  totalVotes: number;
  avgPerformance: number;
  avgSpeed: number;
  avgIntelligence: number;
  avgReliability: number;
}