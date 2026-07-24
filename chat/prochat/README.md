# AI Resume Chatbot Template

A free, open-source template for building your own AI-powered resume Q&A chatbot using **Gemini 1.5 Flash** and **Vercel**. Anyone can ask your chatbot questions about your experience, skills, and background — and it will answer using only the resume data you provide.

Built and open-sourced by [Tormento416](https://github.com/Tormento416).

---

## Features

- AI-powered Q&A trained on your resume data
- Conversation memory (remembers last 8 turns, stays consistent)
- Clean, customizable green & gold chat UI
- Serverless deployment via Vercel
- Powered by Google Gemini 3.1 Flash Lite (free tier available)
- No database required — all resume data lives in one file

---

## Quick Start (5 steps)

### Step 1 — Get a Gemini API Key
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with a Google account
3. Click **Get API Key** and create a new key
4. Copy the key — you will need it in Step 4

### Step 2 — Fork or clone this repo
Click **Fork** at the top right of this page, or:
```bash
git clone https://github.com/Tormento416/AI_resume_chatbot_template.git
cd AI_resume_chatbot_template
```

### Step 3 — Fill in your resume data
Open `api/chat.js` and replace all `[PLACEHOLDER]` values with your own information:

- `[YOUR FULL NAME]` — your name
- `[YOUR CITY, STATE]` — your location
- `[YOUR EMAIL]` — your email address
- `[YOUR LINKEDIN URL]` — your LinkedIn profile URL
- `[SUMMARY]` — 2-4 sentences about your background and target roles
- `[SKILLS]` — your skills grouped by category
- `[EXPERIENCE]` — your work history with bullet-point accomplishments
- `[EDUCATION]` — your degrees and coursework
- `[CERTIFICATIONS]` — your certifications (delete section if not applicable)
- `[PROJECTS]` — your personal/side projects (delete section if not applicable)
- `[LANGUAGES]` — spoken languages (delete section if not applicable)

Also update `index.html` — replace `[YOUR NAME]`, `[INITIALS]`, and `[YOUR TITLE]`.

### Step 4 — Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in (free account)
2. Click **New Project** → Import your forked repo
3. In **Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: your API key from Step 1
4. Click **Deploy**

### Step 5 — Share your chatbot
Vercel will give you a public URL like `your-project.vercel.app`.
Share it on your resume, LinkedIn, or portfolio!

---

## Customizing the Theme

Open `style.css` and edit the `:root` CSS variables to change the color scheme:

```css
:root {
  --bg-dark:       #0d1a0f;   /* main background */
  --green-primary: #2ecc71;   /* primary accent */
  --gold-primary:  #f0c040;   /* secondary accent / user bubbles */
  /* ... more variables inside the file */
}
```

---

## File Structure

```
AI_resume_chatbot_template/
├── index.html          # Chat UI (update name/initials/title)
├── style.css           # All styles (customize colors here)
├── vercel.json         # Vercel deployment config
├── package.json        # Node.js dependencies
├── public/
│   └── app.js          # Frontend logic (no changes needed)
├── api/
│   └── chat.js         # Backend + YOUR RESUME DATA (edit this)
├── README.md           # This file
└── history.txt         # Change log
```

---

## Tips for Best Results

- The more detail you add to `RESUME_DATA`, the better the chatbot answers
- Use specific metrics where possible (e.g. "reduced costs by 30%" beats "reduced costs")
- Add all your skills, tools, and technologies — even ones you use occasionally
- Write your summary as if you are speaking directly to a recruiter
- Test it by asking questions a recruiter would ask

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| AI Model | Google Gemini 3.1 Flash Lite |
| Backend | Node.js (Vercel Serverless Function) |
| Frontend | Vanilla HTML/CSS/JS |
| Hosting | Vercel (free tier) |
| SDK | @google/genai |

---

## License

MIT License — free to use, fork, and modify for personal or commercial use.

---
