# Contributing to LLM Mood Tracker

Thank you for your interest in contributing to LLM Mood Tracker! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

- Check if the issue already exists
- Include steps to reproduce the issue
- Provide system information (OS, Node.js version, etc.)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure
4. Set up MySQL database
5. Run migrations: `npm run db:init`
6. Start development server: `npm run dev`

### Code Style

- Use TypeScript for type safety
- Follow the existing code style
- Run `npm run lint` before committing
- Avoid using `any` types
- Remove console.log statements from production code

### Testing

- Test your changes locally
- Ensure all existing features still work
- Add tests for new features when applicable

## Code of Conduct

Please be respectful and constructive in all interactions.