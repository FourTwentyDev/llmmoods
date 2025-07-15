// Database types for MySQL query results

export interface Model {
  id: string;
  name: string;
  provider: string;
  category: string;
  context_length: number;
  current_performance: number;
  current_intelligence: number;
  total_votes: number;
  overall_score?: number;
  updated_at: Date;
}

export interface CountResult {
  total: number;
}

export interface DailyStat {
  date: string;
  performance: number;
  intelligence: number;
  votes: number;
}

export interface Vote {
  id: number;
  model_id: string;
  fingerprint_hash: string;
  performance: number;
  intelligence: number;
  created_at: Date;
}

export interface Comment {
  id: number;
  model_id: string;
  fingerprint_hash: string;
  content: string;
  sentiment: string;
  created_at: Date;
}

export interface RateLimit {
  fingerprint_hash: string;
  count: number;
  window_start: Date;
}

// MySQL2 specific types
export type QueryResult<T> = [T[], mysql.FieldPacket[]];
export type ExecuteResult = [mysql.ResultSetHeader, mysql.FieldPacket[]];

// Import mysql types
import type mysql from 'mysql2/promise';