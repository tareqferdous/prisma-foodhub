# FoodHub Backend

FoodHub backend is an Express + Prisma API for the food delivery platform. It powers authentication, meals, orders, provider dashboards, customer dashboards, and AI-driven utilities.

## Features

- Express API with CORS and Better Auth session support
- Prisma ORM with PostgreSQL
- Provider and customer dashboard aggregations
- AI chat assistant endpoint powered by OpenRouter
- AI meal description generator for providers
- Contact messages, reviews, meals, orders, and profile APIs

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL database
- OpenRouter API key for AI features

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```bash
DATABASE_URL="your_postgres_connection_string"
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:3000
PROD_APP_URL=https://your-frontend-url.vercel.app
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
OPENROUTER_API_KEY=your_openrouter_api_key
```

3. Generate Prisma client and start the server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start the backend with live reload
- `npm run build` - generate Prisma client and build the API bundle
- `npm run postinstall` - generate Prisma client after install

## API Highlights

### Auth

- `GET /api/auth/*`

### Meals

- `GET /api/meals`
- `GET /api/meals/:id`
- `POST /api/meals` provider only
- `PATCH /api/meals` provider only
- `DELETE /api/meals/:mealId` provider only
- `POST /api/meals/generate-description` provider only, AI-powered

### Profile

- `GET /api/profile/dashboard` customer dashboard data
- `GET /api/profile/recommendations` personalized meal recommendations
- `PUT /api/profile` update profile

### Chat

- `POST /api/chat` homepage AI assistant

## AI Notes

- If `OPENROUTER_API_KEY` is missing, AI endpoints fall back to safe template responses.
- The chat assistant is intended for homepage use only.

## Database

Prisma schema is located at `prisma/schema.prisma` and the generated client output is configured to `../src/generated/prisma`.

## Deployment

Build the backend with:

```bash
npm run build
```

The project is prepared for Vercel/serverless deployment via the generated `api/index.mjs` bundle.
