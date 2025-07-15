import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function getMoodEmoji(score: number): string {
  if (score >= 4.5) return '😄';
  if (score >= 3.5) return '😊';
  if (score >= 2.5) return '😐';
  if (score >= 1.5) return '🤔';
  return '😶';
}

export function getMoodColor(score: number): string {
  if (score >= 4.5) return 'text-green-500';
  if (score >= 3.5) return 'text-emerald-500';
  if (score >= 2.5) return 'text-yellow-500';
  if (score >= 1.5) return 'text-orange-500';
  return 'text-red-500';
}

export function getPerformanceLabel(score: number): string {
  if (score >= 3.5) return 'Excellent';
  if (score >= 2.5) return 'Good';
  if (score >= 1.5) return 'Average';
  return 'Poor';
}

export function getSpeedLabel(score: number): string {
  if (score >= 4.5) return 'Lightning Fast';
  if (score >= 3.5) return 'Fast';
  if (score >= 2.5) return 'Normal';
  if (score >= 1.5) return 'Slow';
  return 'Turtle';
}

export function getIntelligenceLabel(score: number): string {
  if (score >= 4.5) return 'Brilliant';
  if (score >= 3.5) return 'Smart';
  if (score >= 2.5) return 'Okay';
  if (score >= 1.5) return 'Confused';
  return 'Brain Fog';
}