# Achilleus — All‑in‑One Discord Bot

Achilleus is a modular, production‑ready Discord bot built with Node.js and TypeScript, focused on moderation, safety, social notifications, and community utilities—with premium gating, privacy controls, and a minimal dashboard.

## Highlights
- **Moderation**: warnings, timeouts/mutes, kicks, bans, softbans, case logs, action logging, appeals workflow
- **Automod+**: anti-raid, anti-spam, link/mention/filter rules, slowmode/shield/lockdown utilities
- **Tickets**: per-guild categories, transcripts (HTML), SLA timers, escalation
- **Utilities**: reaction/select roles, reminders, polls, suggestions, starboard, giveaways
- **Notifications**: YouTube/Twitch announcements
- **Diagnostics**: health checks, metrics/logging hooks, command latency, shard status
- **Privacy**: retention windows, redaction, opt-out flags for transcripts/logs
- **Premium scaffolding**: feature flags, license checks (stubs), and gating points
- **Dashboard/API scaffold**: REST endpoints and auth placeholders (disabled by default)

## Tech Stack
- Node.js 20+, TypeScript, discord.js
- PostgreSQL via Prisma, Redis for queues and caching
- Docker Compose for dev convenience

## Setup
1. Copy `.env.example` to `.env` and fill required values (Discord token, DB/Redis, optional API keys)
2. Install dependencies: `pnpm install` (or npm)
3. Database setup: `pnpm db:migrate`
4. Development: `pnpm dev`
5. Production: `pnpm build && pnpm start`
6. Enable required Gateway Intents in Discord Developer Portal and invite the bot

## Environment Variables
- `DISCORD_TOKEN`, `DISCORD_CLIENT_ID` - Required Discord bot credentials
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Optional Redis connection for caching and queues
- `YOUTUBE_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` - Optional for notifications
- `API_PORT`, `API_HOST` - Optional for dashboard (development only)

## Notes
- Ships with sensible default guild config and granular permissions
- Includes linting, formatting, and test scaffolding
- Put the bot's role above any roles it needs to manage
- Follow-ups tracked in issues: dashboard enablement, telemetry wiring, premium enforcement