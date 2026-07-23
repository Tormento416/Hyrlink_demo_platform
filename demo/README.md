# HyrLink Standalone Demo Suite

This directory (`/demo/`) is a **100% self-contained, standalone web application** that can be cloned, pulled, or hosted independently without requiring the root Go backend or external database dependencies.

---

## 📁 Directory Structure

```text
demo/
├── index.html            <-- Main Standalone Platform Suite Landing & Dashboards
├── README.md             <-- Documentation & Quick Start Guide
└── chat/
    ├── index.html        <-- Standalone HyrBot Conversational AI Workspace
    └── prochat/          <-- Standalone ProChat AI Portfolio (Elena Rostova)
        ├── index.html
        ├── me.js
        ├── style.css
        ├── app.js
        └── vercel.json
```

---

## 🚀 How to Run Standalone

### Option 1: Direct File Opening (No Installation Required)
Simply double-click `demo/index.html` in your file explorer to open it in any modern browser!

### Option 2: Local Static Web Server
You can serve the `/demo/` folder using any static web server:

**Using Python:**
```bash
cd demo
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Using Node.js (`serve` / `http-server`):**
```bash
npx serve demo
```

### Option 3: Deploy to Cloud Hosting
Deploy the `/demo/` folder directly to static hosting platforms:
- **Vercel**: `vercel demo`
- **Netlify**: Drag and drop the `/demo/` folder into Netlify.
- **GitHub Pages**: Set `/demo/` or repository root as the GitHub Pages source.

---

## 🌟 Included Standalone Features

1. **🏢 Executive Recruiter Dashboard (`demo/index.html`)**:
   - 8 Scored Applicants spanning scores 45/100 to 95/100 and YOE (2 to 14 years).
   - Candidate Sub-Dashboards (*Active*, *Contact / In Progress*, *Flagged Potential 🚩*, *Inactive / Rejected ❌*).
   - Multi-Criteria Filter Bar (*Requisitions*, *Years of Experience*, *Role-Fit Score Brackets*).
   - Candidate Profile Drawer with 3-button decisions (*Reject*, *Potential*, *Move Forward*).

2. **⚙️ Job Configurations Inspector (`demo/index.html`)**:
   - Interactive job posting cards with descriptions, salary ranges, and target skill keywords.

3. **🤖 ProChat AI Portfolio (`demo/chat/prochat/`)**:
   - Instant, open conversational AI portfolio for candidate **Elena Rostova** (Lead AI Data Architect).
   - Built-in Job Description Analyzer (*Paste any job description to evaluate Elena's role-fit score*).
   - Offline intelligent fallback engine — answers questions grounded in Elena's PyTorch RAG, Apache Spark, and distributed systems experience without requiring an external backend server.

4. **💬 HyrBot Chat Assistant (`demo/chat/`)**:
   - Conversational AI workspace with real-time prompt chips and agentic insight cards.
