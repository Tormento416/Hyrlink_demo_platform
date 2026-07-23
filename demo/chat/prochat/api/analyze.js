// Generic JD Analyzer endpoint

const RESUME_SUMMARY = `
{YOUR_RESUME_SUMMARY}
`;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { jdContent, isUrl, profile } = req.body;
  if (!jdContent) return res.status(400).json({ error: 'No JD content provided' });

  let jdText = jdContent;

  // If it's a URL, attempt to fetch the page content
  if (isUrl) {
    try {
      const pageRes = await fetch(jdContent, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ResumeBot/1.0)' }
      });
      const html = await pageRes.text();
      // Strip HTML tags to get plain text
      jdText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4000);
    } catch (err) {
      return res.status(400).json({ error: 'Could not fetch that URL. Try pasting the job description text directly.' });
    }
  }

    const profileBlock = profile
      ? [
          'CANDIDATE QUESTIONNAIRE:',
          `Name: ${String(profile.name || '').trim()}`,
          `Email: ${String(profile.email || '').trim()}`,
          `Phone: ${String(profile.phone || '').trim() || 'Not provided'}`,
          'Resume:',
          String(profile.resume || '').trim().slice(0, 6000)
        ].join('\n')
      : 'CANDIDATE QUESTIONNAIRE: Not provided';

    const analyzePrompt = `
  You are a professional candidate analyzing a job description to assess how your background fits the role.
  Speak in first person. Be direct, polite, and specific. Do not oversell or undersell. Speak professionally and avoid embellishment.
Structure your response in three parts:
1. WHERE I AM A STRONG FIT: Map your specific experience, tools, and stories to the role requirements. Be concrete.
2. WHERE I WOULD BE LEARNING: Be honest about any gaps. Frame them as growth areas, not weaknesses.
3. WHAT CATCHES MY EYE: Note anything in the JD that tells you what problem the company is actually trying to solve -- the thing they are not saying directly. Not assuming, an instinct.

  CANDIDATE BACKGROUND:
${RESUME_SUMMARY}

${profileBlock}

JOB DESCRIPTION:
${jdText.slice(0, 3500)}

Assistant:
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analyzePrompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 800 }
        })
      }
    );
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not analyze the job description.';
    res.status(200).json({ reply });
  } catch (err) {
    console.error('Analyze API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
