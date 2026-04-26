# GSTV x Prosper — GTM Engagement Agent

An AI-powered engagement tool for the GSTV x Prosper and Partners GTM strategy engagement (April–May 2026). Runs all Phase 1 and Phase 2 tasks directly in the browser, powered by OpenAI GPT-4o.

## What it does

- 19 tracked tasks across Phase 1 (Diagnosis) and Phase 2 (Build)
- Each task has AI-powered run buttons that execute inline — no copy/paste required
- Interview tasks include outreach email drafting (GSTV sales team and buyer/agency contacts)
- Always-On workstreams: evidence bank, vertical prioritization, feedback loop
- Progress tracker across the full engagement

## Project structure

```
gstv-gtm-agent/
  api/
    run.js          # Vercel serverless function — calls OpenAI API
  public/
    index.html      # Full frontend UI (single file, no build step)
  .env.example      # Environment variable template
  .gitignore
  package.json
  vercel.json       # Vercel function config (timeout, memory)
  README.md
```

## Deploy to Vercel

**1. Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/gstv-gtm-agent.git
git push -u origin main
```

**2. Import on Vercel**

Go to [vercel.com](https://vercel.com), click "Add New Project" and import the GitHub repo. No build configuration needed — Vercel auto-detects the `api/` and `public/` folders.

**3. Add your OpenAI API key**

In Vercel: Settings → Environment Variables → add:

```
OPENAI_API_KEY = sk-...your-key...
```

Redeploy. The app is live at your Vercel URL.

## Local development

Install the Vercel CLI and run locally:

```bash
npm install
npm install -g vercel
vercel dev
```

Then open `http://localhost:3000` in your browser.

Create a `.env` file (not committed) with your key:

```
OPENAI_API_KEY=sk-...your-key...
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key — set in Vercel dashboard, never in code |

## Model

Uses `gpt-4o`. Each button click is one API call, typically $0.01–0.03 depending on output length.

## Notes

- Task completion (checkboxes) is session-only — resets on page refresh. For persistent state across the team, a database layer can be added.
- The OpenAI key is server-side only and never exposed to the browser.
- The 30-second function timeout in `vercel.json` covers longer GPT-4o responses.
