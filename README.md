# Agent Aik

**Managed AI Agent Platform** — Deploy, manage, and monitor AI agents for your business.

## Features

- 🤖 **Agent Management** — Create, configure, and test AI agents with Claude
- 🔄 **Visual Workflow Builder** — Design multi-step agent workflows with drag-and-drop
- 📊 **Execution Monitoring** — Real-time logs, token tracking, and cost analytics
- 🔑 **API Key Management** — Secure programmatic access with scoped API keys
- 👥 **Multi-tenancy** — Workspace isolation with team support
- 🔒 **Authentication** — Email/password with NextAuth.js (OAuth ready)

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, React Flow
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js with JWT sessions
- **AI:** Anthropic Claude API
- **Testing:** Vitest (unit), Playwright (e2e)
- **Deployment:** Docker, Vercel, or VPS

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+ (or use Docker)

### Local Development

```bash
# Clone
git clone <repo-url> && cd agent-aik

# Install deps
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and ANTHROPIC_API_KEY

# Set up database
npx prisma migrate dev

# Seed demo data (optional)
npx prisma db seed

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo credentials:** `demo@agentaik.com` / `demo1234` (after seeding)

### Docker

```bash
# Start everything
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy

# Optional: seed
docker compose exec app npx prisma db seed
```

## API Usage

### Authentication

Use API keys for programmatic access:

```bash
# Create an API key in Settings > API Keys, then:
curl -H "Authorization: Bearer aik_your_key_here" \
  http://localhost:3000/api/agents
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agents` | List agents |
| POST | `/api/agents` | Create agent |
| GET | `/api/agents/:id` | Get agent |
| PATCH | `/api/agents/:id` | Update agent |
| DELETE | `/api/agents/:id` | Delete agent |
| POST | `/api/agents/:id/execute` | Execute agent |
| GET | `/api/workflows` | List workflows |
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows/:id` | Get workflow |
| PATCH | `/api/workflows/:id` | Update workflow (+ steps) |
| DELETE | `/api/workflows/:id` | Delete workflow |
| GET | `/api/executions` | List executions |
| GET | `/api/executions/:id` | Get execution detail |
| GET | `/api/api-keys` | List API keys |
| POST | `/api/api-keys` | Create API key |
| DELETE | `/api/api-keys/:id` | Revoke API key |

### Execute an Agent

```bash
curl -X POST http://localhost:3000/api/agents/<agent-id>/execute \
  -H "Authorization: Bearer aik_your_key" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is our refund policy?"}'
```

Response:
```json
{
  "executionId": "clx...",
  "content": "Based on our policy...",
  "tokensUsed": { "input": 150, "output": 200 },
  "costCents": 1,
  "durationMs": 1234,
  "model": "claude-sonnet-4-20250514"
}
```

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests (requires running dev server)
npm run test:e2e
```

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Set environment variables (DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY)
4. Deploy

### VPS (Docker)

```bash
docker compose -f docker-compose.yml up -d
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing |
| `NEXTAUTH_URL` | Yes | App URL (e.g., `https://app.agentaik.com`) |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |

## Project Structure

```
agent-aik/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages (login, register)
│   └── (dashboard)/       # Dashboard pages
├── src/
│   ├── components/        # React components
│   └── lib/               # Shared utilities
├── prisma/                # Database schema & migrations
├── __tests__/             # Unit tests
├── e2e/                   # E2E tests
├── docker-compose.yml     # Docker setup
├── Dockerfile             # Production Docker image
└── .github/workflows/     # CI/CD
```

## License

Proprietary — © 2026 Agent Aik
