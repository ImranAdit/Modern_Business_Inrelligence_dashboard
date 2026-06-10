# DataPulse BI — Adit Pay Intelligence Dashboard

A **single-file** Business Intelligence dashboard for Stripe connected-accounts analytics. No build step, no database, no backend required — just open `index.html`.

---

## ✨ Features

| Category | Details |
|---|---|
| **9 Dashboard Pages** | Overview, Accounts, Revenue, Trends, AI Insights, Pivot Table, Anomalies, Raw Data, Upload |
| **Charts** | Bar, line, donut, pie, scatter, histogram, pareto, heatmap (12 charts total) |
| **KPI Cards** | Animated counters, color-coded accent bars, hover effects |
| **Filters** | Status, volume tier, sort, live search with highlight, pagination |
| **AI Q&A** | Natural language questions answered via Anthropic API |
| **File Upload** | CSV + XLSX drag-and-drop with full data reload — auto-detects column types |
| **Export** | One-click CSV export of full dataset |
| **Design** | Dark luxury fintech theme · DM Sans + DM Mono + DM Serif Display · glassmorphism cards |

---

## 🚀 Deploy to Railway (3 steps)

### Option A — GitHub → Railway (recommended)

**1. Push this repo to GitHub**
```bash
git init
git add .
git commit -m "DataPulse BI dashboard"
git remote add origin https://github.com/YOUR_USERNAME/datapulse-bi.git
git push -u origin main
```

**2. Create Railway project**
- Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
- Select your repo — Railway auto-detects the `Dockerfile`
- Click **Deploy**

**3. Done** — you'll get a public URL like `https://datapulse-bi.up.railway.app` in ~60 seconds

---

### Option B — Railway CLI
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

### Option C — Docker locally
```bash
docker build -t datapulse-bi .
docker run -p 3000:3000 datapulse-bi
# Open http://localhost:3000
```

---

### Option D — Open directly in browser (zero setup)
```bash
open index.html   # macOS
start index.html  # Windows
```
No server needed — works as a local file.

---

## 💻 Local Development
```bash
npm install
npm start
# Open http://localhost:3000
```

---

## 📁 File Structure

```
datapulse-bi/
├── index.html        ← Entire dashboard (107 KB, self-contained)
├── server.js         ← Tiny Express static server
├── package.json      ← Node dependency (express only)
├── Dockerfile        ← Docker / Railway build config
├── railway.toml      ← Railway deploy settings
├── .gitignore
└── README.md
```

---

## 📤 Uploading Your Own Data

Click **Upload Dataset** in the sidebar (or the ⊕ button) and drop any CSV or XLSX file.

The engine automatically:
- Detects column types (`currency`, `number`, `date`, `string`, `boolean`, `percentage`)
- Fuzzy-matches columns to dashboard fields (ID, Name, Status, Volume, Balance, dates)
- Cleans values — strips `$`, `,`, normalises dates, removes blank rows and duplicates
- Picks the largest sheet in multi-sheet Excel files
- Rebuilds **all 9 pages and all 12 charts** with your data instantly

Works with any Stripe-style export or general financial CSV.

---

## 🤖 AI Insights

The AI page calls the Anthropic API (`claude-sonnet-4`) with your dataset stats and the question you type. If the API is unavailable, a local fallback answers from pre-computed stats.

---

## 🌐 Environment Variables

| Variable | Set by | Notes |
|---|---|---|
| `PORT` | Railway (auto) | Defaults to 3000 |

No API keys required in env — the Anthropic call is made client-side via the Claude.ai proxy when used inside Claude artifacts.

---

## 📊 Included Demo Dataset

Pre-loaded with **1,107 Stripe connected accounts** (Adit Pay report, May 2026):
- Total volume: **$349.6M**
- 7 columns: ID, Account name, Status, Volume, Balance, Connected on, Last active
- Date range: Oct 2021 – May 2026
