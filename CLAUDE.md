# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LLM Mood Tracker is a Next.js 15 web application that tracks and compares the daily performance of AI language models through community-driven ratings. Built with TypeScript, Tailwind CSS, and MySQL.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Initialize database (requires MySQL)
npm run db:init

# Seed database with initial models
npm run db:seed
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.1 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **Database**: MySQL 8.0+ with foreign key constraints
- **Analytics**: Google Analytics 4 with GDPR-compliant cookie consent
- **Charts**: Recharts
- **UI Components**: Radix UI primitives

### Key Design Patterns
1. **Privacy-First**: Uses fingerprint hashing instead of storing user data (GDPR compliant)
2. **Rate Limiting**: Fingerprint-based rate limiting for votes and comments
3. **Performance**: Daily aggregation tables for fast statistics queries
4. **SEO**: Dynamic sitemaps, robots.txt, and proper meta tags

### Database Schema
- `models`: LLM registry with provider, category, and context length
- `votes`: User ratings (1 vote per model per fingerprint per day)
- `daily_stats`: Pre-aggregated statistics for performance
- `comments`: Rate-limited user feedback
- `rate_limits`: Tracks API usage by fingerprint

### API Routes Structure
- `/api/models`: Get model list and details
- `/api/vote`: Submit ratings (rate-limited)
- `/api/stats/[modelId]`: Get historical performance data
- `/api/cron/sync-models`: Sync models from OpenRouter (protected endpoint)

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=mysql://user:password@localhost:3306/llmmood
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
RATE_LIMIT_WINDOW_MS=86400000
RATE_LIMIT_MAX_VOTES=10
```

## Key Implementation Details

### Fingerprinting (`src/lib/fingerprint.ts`)
Generates consistent browser fingerprints using UA, screen resolution, timezone, and canvas fingerprinting. Hashed with SHA-256 for privacy.

### Rate Limiting (`src/lib/rate-limit.ts`)
Enforces voting limits per fingerprint within a 24-hour window. Automatically cleans old entries.

### Model Syncing (`src/lib/models.ts`)
Fetches model data from OpenRouter API, filtering for popular providers (OpenAI, Anthropic, Google, Meta, etc.).

### Database Queries
All database operations use the mysql2 library with prepared statements to prevent SQL injection. Connection pooling is implemented in `src/lib/db/index.ts`.