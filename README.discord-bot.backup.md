# Achilleus — All‑in‑One Discord Bot

Achilleus is a modular, production‑ready Discord bot focused on safety, moderation, social notifications, and community utilities—with premium gating, privacy controls, and a minimal dashboard.

Highlights
- Safety/moderation: warn/timeout/kick/ban/softban, purge/slowmode, cases/notes, full logs, verification
- Automod+: invites/links/caps/emoji/dupes, regex/phrases, channel exemptions, escalations
- Anti‑raid Shield: presets, server‑wide lockdown, automatic rollback
- Tickets & transcripts: ticket workflow + HTML transcripts (embeds/attachments)
- Social: YouTube (RSS with ETag), Twitch (Helix polling/EventSub‑ready), TikTok oEmbed
- Utilities: reaction/select roles, reminders, polls, suggestions, starboard, giveaways
- Music: Lavalink‑based playback (basic queue)
- Admin/Ops: /diagnose, permission doctor, premium/licensing, privacy & retention cleaning
- Dashboard (scaffold): FastAPI health endpoint; ready for expansion

Quick start
1) Requirements: Python 3.11+, Postgres, Redis (optional), Discord app with Guild Members + Message Content intents
2) Copy .env.example to .env and fill values
3) Install and run:
   - python -m venv .venv && source .venv/bin/activate
   - pip install -r requirements.txt
   - python -m bot
4) Optional: Dashboard scaffold
   - uvicorn web.app:app --reload

Environment
- DISCORD_TOKEN, DISCORD_CLIENT_ID
- DATABASE_URL (postgres+asyncpg://user:pass@host:5432/db)
- REDIS_URL (optional)
- YOUTUBE_API_KEY (optional for search; RSS notify works with no key)
- TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET
- LAVALINK_HOST, LAVALINK_PORT, LAVALINK_PASSWORD (for music)
- OPENAI_API_KEY (optional for future AI link‑scan)

Notes
- Put the bot’s role above any roles it needs to manage.
- Use Message Content intent only if needed; keep modules configurable.
- Music requires a Lavalink node (see https://github.com/lavalink-devs/Lavalink).
