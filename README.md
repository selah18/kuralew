# Kuralew ቁራሌው — Telegram Mini App

A mobile-first Ethiopian peer-to-peer classifieds marketplace prototype, designed to run as a Telegram Web App and deploy on Cloudflare's free tier.

## Included
- Interactive home feed, search, categories, location/condition/sort filters
- Listing detail sheets, save/favourite items, post listing form
- Local demo chats, listing reports, profile, and safety guidance
- Telegram Web App SDK integration (automatically expands when opened inside Telegram)
- Cloudflare Worker API and D1 schema for public listings and reports
- Frontend works as a demo without API configuration; demo listings/saved items/chats are device-local

## Local preview
Open `public/index.html` in a browser or serve the `public` folder with any static server. For full API integration, deploy the Worker and set `window.KURALEW_API_BASE` to its URL (or host the frontend on the same Worker domain).

## Deploy to Cloudflare Workers + D1 (free tier)
1. Create a Cloudflare account and install Node.js/npm on your computer.
2. In this folder, run `npm create cloudflare@latest` only if you want a fresh scaffolding; this repo already contains a `wrangler.toml`.
3. Run `npx wrangler login`.
4. Create the D1 database: `npx wrangler d1 create kuralew-db`.
5. Copy the returned database ID into `wrangler.toml` in place of `REPLACE_WITH_YOUR_D1_DATABASE_ID`.
6. Create the schema: `npx wrangler d1 execute kuralew-db --remote --file=worker/schema.sql`.
7. Deploy: `npx wrangler deploy`.
8. Set the Telegram bot's Mini App URL to the deployed HTTPS URL using BotFather. Create the bot with BotFather first.

## Important production security work
This is a functional prototype, not yet a fully trusted public marketplace. Before enabling public posting:
- Implement Telegram `initData` signature validation server-side using the bot token stored as a Cloudflare secret. Never expose the bot token in frontend code.
- Add authenticated ownership, rate limiting, listing moderation, and admin tools. The current Worker deliberately refuses public listing creation unless the environment variable `ALLOW_UNAUTHENTICATED_POSTS` is set to `true`; do not enable this on a public deployment.
- Persist and authenticate chats/favourites if needed; current chats and favourites are local demo state.
- Add real image upload storage and moderation; this prototype accepts HTTPS image URLs only.
- Only show verified badges after an actual verification process. No identity or phone verification is implemented here.
- Do not hold funds or advertise escrow until an appropriately licensed payment provider and local legal requirements are confirmed. No payments/escrow are implemented here.
- Add spam prevention, prohibited item policy, privacy notice, terms, account deletion and data retention controls.

## API
- `GET /api/health`
- `GET /api/listings?q=&category=&city=`
- `POST /api/listings` (intentionally gated pending Telegram authentication)
- `POST /api/reports`

## Brand
Kuralew ቁራሌው — “Find it. Sell it. Kuralew it.”
