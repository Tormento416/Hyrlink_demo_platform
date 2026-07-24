# HyrLink Standalone Web Application (Vercel Ready)

This repository is a **100% self-contained, standalone web application** optimized for zero-config deployment on **Vercel**. It operates completely independently without requiring external database dependencies or legacy backends.

---

## 📁 Directory Structure

```text
├── index.html            <-- Executive Recruiter Dashboard & Suite Landing
├── package.json          <-- Project Manifest & Node Dependencies
├── vercel.json           <-- Vercel Routing & Serverless Endpoint Configuration
├── README.md             <-- Documentation & Deployment Guide
├── api/
│   ├── chat.js           <-- ProChat Candidate Q&A Serverless Endpoint
│   ├── analyze.js        <-- Job Description Fit Evaluator Serverless Endpoint
│   └── candidate-chat.js <-- HyrBot AI Assistant Serverless Endpoint
└── chat/
    ├── index.html        <-- HyrBot Conversational AI Workspace (/chat)
    └── prochat/          <-- ProChat AI Portfolio - Elena Rostova (/chat/prochat)
        ├── index.html
        ├── me.js
        └── style.css
```

---

## ⚡ Deployment to Vercel

### Option 1: Vercel CLI (Recommended)

1. Open your terminal in the project directory:
   ```bash
   vercel
   ```
2. Follow the prompts to deploy instantly to your Vercel account.

### Option 2: Vercel Git Integration

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. Vercel will automatically detect `vercel.json` and deploy both the static pages and the `/api/` serverless functions.

---

## 🔑 Environment Variables (Optional)

To enable live Google Gemini AI responses in serverless functions:

1. In your Vercel Project Settings, navigate to **Environment Variables**.
2. Add the following key:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `GEMINI_MODEL`: (Optional, defaults to `gemini-2.5-flash`).

> **Note**: If `GEMINI_API_KEY` is not provided, the application seamlessly uses its built-in offline intelligent fallback engine to answer candidate and recruiter prompts instantly!

---

## 🚀 How to Run Locally

### Using Vercel CLI (With Serverless API Functions):
```bash
npx vercel dev
```
Open `http://localhost:3000` in your browser.

### Using Static Server (Offline / Demo Mode):
```bash
npx serve .
# OR
python -m http.server 8000
```

---

## 🌟 Included Standalone Features

1. **🏢 Executive Recruiter Dashboard (`/`)**:
   - 8 Scored Applicants spanning scores 45/100 to 95/100 and YOE (2 to 14 years).
   - Candidate Sub-Dashboards (*Active*, *Contact / In Progress*, *Flagged Potential 🚩*, *Inactive / Rejected ❌*).
   - Multi-Criteria Filter Bar (*Requisitions*, *Years of Experience*, *Role-Fit Score Brackets*).
   - Candidate Profile Drawer with 3-button decisions (*Reject*, *Potential*, *Move Forward*).

2. **⚙️ Job Configurations Inspector (`/`)**:
   - Interactive job posting cards with descriptions, salary ranges, and target skill keywords.

3. **🤖 ProChat AI Portfolio (`/chat/prochat/`)**:
   - Instant conversational AI portfolio for Lead AI Data Architect **Elena Rostova**.
   - Built-in Job Description Analyzer (*Paste any job description to evaluate role-fit score*).
   - Live Gemini serverless backend with offline intelligent fallback engine.

4. **💬 HyrBot Chat Assistant (`/chat/`)**:
   - Conversational AI workspace with prompt chips and agentic recruiter insight cards.
