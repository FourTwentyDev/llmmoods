# LLM Mood Tracker

Track and compare the daily performance of popular AI language models. Community-driven ratings for GPT-4, Claude, Gemini, and more.

## Features

- 📊 Daily mood tracking for LLMs
- 🎯 Rate models on Performance, Speed, Intelligence, and Reliability
- 📈 Historical performance charts
- 🔒 GDPR-compliant, privacy-first design
- ⚡ Real-time updates
- 🚀 SEO optimized

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with partitioning
- **Analytics**: Plausible (GDPR-compliant)
- **Charts**: Recharts
- **Rate Limiting**: Fingerprint-based

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FourTwentyDev/llmmoods.git
cd llmmood
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your database credentials and Plausible domain.

4. Initialize the database:
```bash
npm run db:init
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Setup

Create a MySQL database and user:
```sql
CREATE DATABASE llmmood;
CREATE USER 'llmmood'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON llmmood.* TO 'llmmood'@'localhost';
FLUSH PRIVILEGES;
```

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Cron Jobs

Set up a daily cron job to sync models:
```
0 0 * * * curl https://llmmood.com/api/cron/sync-models -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Contributing

Pull requests are welcome! Please read our contributing guidelines first.

## License

MIT License - see LICENSE file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://fourtwenty.dev">FourTwenty Development</a>
</p>