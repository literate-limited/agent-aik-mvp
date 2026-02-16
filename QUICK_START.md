# Agent Aik MVP - Quick Start Guide

**Current Status:** ❌ NOT DEPLOYED (ready to deploy)  
**URL:** https://agent-aik-mvp.vercel.app (404 until deployed)

---

## 🚀 Deploy in 5 Minutes

### Step 1: Set Environment Variables

Go to: https://vercel.com/literate-limiteds-projects/agent-aik-mvp/settings/environment-variables

Add these **4 required** variables:

```bash
# Database (use Vercel Postgres or external)
DATABASE_URL="postgresql://user:pass@host:5432/agentaik?schema=public"

# Auth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="<your-32-char-random-string>"

# Production URL
NEXTAUTH_URL="https://agent-aik-mvp.vercel.app"

# Claude API key
ANTHROPIC_API_KEY="sk-ant-..."
```

### Step 2: Deploy

**Option A (Automatic):**
- Just push to `main` branch → Auto-deploys

**Option B (Manual):**
- Vercel Dashboard → Deployments → Deploy

### Step 3: Run Database Migrations

```bash
# After first deployment
vercel env pull .env.production.local
npx prisma migrate deploy
npx prisma db seed  # Optional: adds demo account
```

### Step 4: Test

1. **Signup:** https://agent-aik-mvp.vercel.app/register
2. **Create agent:** Dashboard → Agents → New Agent
3. **Test execution:** Agent detail → Test tab → Run test

---

## 🎨 5 Pre-Built Templates Ready

**Location:** `/templates/` directory

1. 👥 **Customer Support** - First-line support automation
2. 🎯 **Lead Generation** - BANT qualification & demo scheduling
3. 📊 **Data Entry** - Form/document extraction & validation
4. 💰 **Invoice Processing** - AP automation & PO matching
5. 🎫 **Ticket Triage** - Smart categorization & routing

**Import:** Dashboard → Agents → Import Template

---

## 📚 Full Documentation

- **`DEPLOYMENT_STATUS.md`** - Detailed deployment guide
- **`TESTING_GUIDE.md`** - 18-test checklist
- **`templates/README.md`** - Template documentation
- **`SUBAGENT_REPORT.md`** - Full status report

---

**ETA to live:** ~5 minutes after env vars are set  
**Blocker:** Manual Vercel env var configuration  
**Next step:** Set the 4 required environment variables ☝️
