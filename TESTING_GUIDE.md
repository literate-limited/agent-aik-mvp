# Agent Aik MVP - Testing Guide

**Purpose:** Comprehensive testing checklist for post-deployment validation  
**Created:** 2026-02-16  
**Tester:** Main Agent / Human

---

## 🎯 Testing Objectives

Verify that all 3 core features work correctly:
1. **User Flow:** Signup → Login → Dashboard access
2. **Agent Flow:** Create agent → Configure → Test execution
3. **Execution Flow:** Run test → View results → Monitor performance

---

## ✅ Pre-Testing Checklist

Before starting tests, verify:
- [ ] Site is accessible at https://agent-aik-mvp.vercel.app
- [ ] Environment variables are set correctly
- [ ] Database migrations have been run
- [ ] ANTHROPIC_API_KEY is valid and has credits
- [ ] Browser console is open (to catch any errors)

---

## Test Suite 1: Authentication & User Management

### 1.1 User Registration
**URL:** https://agent-aik-mvp.vercel.app/register

**Steps:**
1. Navigate to /register
2. Fill in form:
   - Name: Test User
   - Email: test+[timestamp]@example.com (use unique email)
   - Password: TestPass123!
3. Click "Create Account"

**Expected Results:**
- ✅ Form validates (checks password strength, email format)
- ✅ Account created successfully
- ✅ Redirects to /dashboard
- ✅ Welcome message appears
- ✅ Database: User record created with hashed password

**Failure Modes:**
- ❌ Validation errors → Check Zod schema in auth route
- ❌ "User already exists" → Email is duplicate
- ❌ Database error → Check DATABASE_URL and Prisma connection
- ❌ No redirect → Check NextAuth configuration

---

### 1.2 User Login
**URL:** https://agent-aik-mvp.vercel.app/login

**Steps:**
1. Log out (if logged in)
2. Navigate to /login
3. Enter credentials from 1.1
4. Click "Sign In"

**Expected Results:**
- ✅ Successful authentication
- ✅ Redirects to /dashboard
- ✅ Session cookie set
- ✅ User data visible in dashboard

**Failure Modes:**
- ❌ "Invalid credentials" → Password mismatch or user not found
- ❌ Infinite redirect → Check NEXTAUTH_URL and NEXTAUTH_SECRET
- ❌ Session not persisting → Check cookie settings

---

### 1.3 Session Persistence
**Steps:**
1. Log in successfully
2. Refresh page
3. Close browser and reopen
4. Navigate to /dashboard

**Expected Results:**
- ✅ User stays logged in across refreshes
- ✅ Session persists after browser close (if "Remember me" checked)
- ✅ Protected routes redirect to login if not authenticated

---

## Test Suite 2: Agent Creation & Configuration

### 2.1 Create Agent (Basic)
**URL:** https://agent-aik-mvp.vercel.app/dashboard/agents/new

**Steps:**
1. Navigate to Agents page
2. Click "Create Agent"
3. Fill in form:
   - Name: "Test Support Agent"
   - Description: "Handles customer inquiries"
   - System Prompt: "You are a helpful customer support agent."
   - Model: claude-sonnet-4-20250514
   - Temperature: 0.7
   - Max Tokens: 1024
4. Click "Create"

**Expected Results:**
- ✅ Agent created successfully
- ✅ Redirects to agent detail page
- ✅ Agent appears in agents list
- ✅ All fields saved correctly
- ✅ Database: Agent record created with correct workspace_id

**Failure Modes:**
- ❌ Validation errors → Check form validation
- ❌ "Unauthorized" → Session issue or workspace mismatch
- ❌ Database error → Check Prisma schema

---

### 2.2 Edit Agent
**Steps:**
1. Navigate to agent detail page
2. Click "Edit"
3. Modify system prompt
4. Change temperature to 0.5
5. Click "Save"

**Expected Results:**
- ✅ Changes saved successfully
- ✅ Updated values reflected in UI
- ✅ Database: Agent record updated

---

### 2.3 Import Template
**Steps:**
1. Navigate to Agents page
2. Click "Import Template"
3. Select `templates/customer-support.json`
4. Review pre-filled values
5. Click "Import"

**Expected Results:**
- ✅ Template loaded into form
- ✅ All template fields populated correctly
- ✅ Agent created from template

---

## Test Suite 3: Agent Execution

### 3.1 Test Execution (UI)
**URL:** Agent detail page → Test tab

**Steps:**
1. Navigate to agent detail page
2. Click "Test" tab
3. Enter test message: "How do I reset my password?"
4. Click "Run Test"
5. Wait for response

**Expected Results:**
- ✅ Execution starts immediately
- ✅ Loading indicator appears
- ✅ Response appears within 5 seconds
- ✅ Response is relevant to prompt
- ✅ Execution metadata shown:
  - Token usage (input + output)
  - Cost (in cents)
  - Duration (in ms)
  - Model used
- ✅ Database: Execution record created

**Failure Modes:**
- ❌ "API key invalid" → Check ANTHROPIC_API_KEY
- ❌ Timeout (>30s) → Check Anthropic API status
- ❌ Empty response → Check system prompt and model settings
- ❌ Error message → Check error logs in Vercel

---

### 3.2 Test Execution (API)
**Endpoint:** `POST /api/agents/:id/execute`

**Steps:**
1. Generate API key in Settings → API Keys
2. Copy API key (format: `aik_...`)
3. Make API request:

```bash
curl -X POST https://agent-aik-mvp.vercel.app/api/agents/{AGENT_ID}/execute \
  -H "Authorization: Bearer aik_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is your refund policy?"}'
```

**Expected Response:**
```json
{
  "executionId": "clx...",
  "content": "Our refund policy...",
  "tokensUsed": {
    "input": 150,
    "output": 200
  },
  "costCents": 1,
  "durationMs": 1234,
  "model": "claude-sonnet-4-20250514"
}
```

**Expected Results:**
- ✅ 200 OK status
- ✅ Valid JSON response
- ✅ Response content is relevant
- ✅ Token counts are non-zero
- ✅ Cost calculation is correct
- ✅ Execution logged in database

**Failure Modes:**
- ❌ 401 Unauthorized → Invalid API key
- ❌ 404 Not Found → Agent ID doesn't exist
- ❌ 500 Server Error → Check server logs

---

### 3.3 Execution History
**URL:** Agent detail page → History tab

**Steps:**
1. Run multiple test executions (3-5)
2. Navigate to History tab
3. Review execution list

**Expected Results:**
- ✅ All executions listed in reverse chronological order
- ✅ Each execution shows:
  - Timestamp
  - Input message (truncated)
  - Output preview (truncated)
  - Token usage
  - Cost
  - Duration
- ✅ Click execution → Full details shown
- ✅ Pagination works (if >20 executions)

---

## Test Suite 4: API Key Management

### 4.1 Create API Key
**URL:** https://agent-aik-mvp.vercel.app/dashboard/settings/api-keys

**Steps:**
1. Navigate to Settings → API Keys
2. Click "Create API Key"
3. Enter name: "Test Key"
4. Click "Generate"
5. Copy generated key (shown once)

**Expected Results:**
- ✅ API key generated (format: `aik_` + 32 random chars)
- ✅ Key shown once (masked after)
- ✅ Key appears in list with:
  - Name
  - Prefix (first 8 chars)
  - Created date
  - Last used (null initially)
- ✅ Database: API key hashed and stored

---

### 4.2 Use API Key
**Steps:**
1. Use API key from 4.1 to make API request (see 3.2)
2. Check API key list

**Expected Results:**
- ✅ Request succeeds
- ✅ "Last Used" timestamp updated in key list

---

### 4.3 Revoke API Key
**Steps:**
1. Click "Revoke" on API key
2. Confirm revocation
3. Try to use revoked key

**Expected Results:**
- ✅ Key removed from list
- ✅ API requests with revoked key return 401 Unauthorized
- ✅ Database: Key marked as revoked (soft delete)

---

## Test Suite 5: Dashboard & Analytics

### 5.1 Dashboard Overview
**URL:** https://agent-aik-mvp.vercel.app/dashboard

**Steps:**
1. Navigate to /dashboard
2. Review overview page

**Expected Results:**
- ✅ Agent count displayed
- ✅ Total execution count displayed
- ✅ Recent executions list (last 10)
- ✅ Quick actions available (Create Agent, View Agents)

---

### 5.2 Agent List
**URL:** https://agent-aik-mvp.vercel.app/dashboard/agents

**Steps:**
1. Navigate to Agents page
2. Review agent list

**Expected Results:**
- ✅ All agents displayed
- ✅ Each agent card shows:
  - Name
  - Description
  - Model
  - Last execution timestamp
  - Execution count
- ✅ Search/filter works (if implemented)
- ✅ Click agent → Navigate to detail page

---

### 5.3 Cost Tracking
**Steps:**
1. Run multiple executions
2. Navigate to analytics/cost page (if implemented)

**Expected Results:**
- ✅ Total cost displayed (sum of all executions)
- ✅ Cost breakdown by agent
- ✅ Cost over time chart (if implemented)
- ✅ Token usage stats

---

## Test Suite 6: Error Handling & Edge Cases

### 6.1 Invalid Inputs
**Tests to run:**
- [ ] Create agent with empty name → Validation error
- [ ] Create agent with invalid model → Error message
- [ ] Execute with empty message → Validation error
- [ ] Use invalid API key → 401 Unauthorized
- [ ] Access non-existent agent ID → 404 Not Found

---

### 6.2 Rate Limiting (if implemented)
**Steps:**
1. Make rapid API requests (>10/second)

**Expected Results:**
- ✅ Rate limit hit → 429 Too Many Requests
- ✅ Retry-After header included

---

### 6.3 Large Inputs
**Steps:**
1. Execute agent with very long message (>10,000 chars)

**Expected Results:**
- ✅ Request accepted or rejected gracefully
- ✅ No server crash
- ✅ Clear error message if rejected

---

## Test Suite 7: Security

### 7.1 Authentication Protection
**Tests to run:**
- [ ] Access /dashboard without login → Redirect to /login
- [ ] Access /api/agents without auth → 401 Unauthorized
- [ ] Try to access another user's agent → 403 Forbidden or 404

---

### 7.2 SQL Injection Prevention
**Steps:**
1. Try SQL injection in form fields:
   - Name: `'; DROP TABLE agents; --`
   - Email: `test@test.com'; DROP TABLE users; --`

**Expected Results:**
- ✅ Inputs sanitized (Prisma handles this)
- ✅ No database changes
- ✅ No error messages revealing DB structure

---

### 7.3 XSS Prevention
**Steps:**
1. Create agent with name: `<script>alert('XSS')</script>`
2. View agent list

**Expected Results:**
- ✅ Script not executed
- ✅ HTML escaped in output

---

## 🎯 Success Criteria

**ALL tests must pass for deployment to be considered successful:**

| Category | Pass Criteria | Status |
|----------|---------------|--------|
| Authentication | All login/signup flows work | ⬜ |
| Agent Creation | Can create, edit, delete agents | ⬜ |
| Agent Execution | Executions complete successfully | ⬜ |
| API Keys | Can generate, use, and revoke keys | ⬜ |
| Dashboard | All pages load and display data | ⬜ |
| Security | No auth bypasses, XSS, or SQL injection | ⬜ |
| Performance | Agent execution <5s, page load <2s | ⬜ |
| Error Handling | Graceful errors, no crashes | ⬜ |

---

## 📊 Performance Benchmarks

**Target metrics:**
- Page load time: <2 seconds
- Agent execution time: <5 seconds (for standard prompts)
- API response time: <1 second (excluding AI execution)
- Database query time: <100ms

**Measure with:**
- Browser DevTools → Network tab
- Vercel Analytics
- Database query logs

---

## 🐛 Bug Reporting Template

If you find issues, report using this format:

```
**Bug Title:** [Concise description]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Logs:**
[Attach if available]

**Environment:**
- Browser: [Chrome 120, Safari 17, etc.]
- Device: [Desktop, Mobile, etc.]
- URL: [Specific page where bug occurred]

**Severity:**
- [ ] Critical (blocks core functionality)
- [ ] High (major feature broken)
- [ ] Medium (feature degraded)
- [ ] Low (cosmetic or minor)
```

---

## 📝 Testing Checklist Summary

**Quick reference for manual testing:**

- [ ] ✅ Site is accessible
- [ ] ✅ User registration works
- [ ] ✅ User login works
- [ ] ✅ Session persists across refreshes
- [ ] ✅ Create agent (basic)
- [ ] ✅ Import agent template
- [ ] ✅ Edit agent
- [ ] ✅ Test agent execution (UI)
- [ ] ✅ Test agent execution (API)
- [ ] ✅ View execution history
- [ ] ✅ Create API key
- [ ] ✅ Use API key successfully
- [ ] ✅ Revoke API key
- [ ] ✅ Dashboard loads correctly
- [ ] ✅ Agent list displays all agents
- [ ] ✅ Cost tracking works
- [ ] ✅ Error handling works
- [ ] ✅ Security tests pass
- [ ] ✅ Performance meets targets

---

**Testing completed by:** _______________  
**Date:** _______________  
**Result:** ⬜ PASS | ⬜ FAIL  
**Notes:** _______________
