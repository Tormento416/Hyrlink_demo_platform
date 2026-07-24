const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      reply: null,
      message: "GEMINI_API_KEY environment variable not configured. Client will use intelligent offline engine."
    });
  }

  const systemPrompt = `You are HyrBot, an AI Career Copilot & Executive Recruiter Assistant.
You provide strategic analysis on candidate profiles, role-fit scoring, resume optimizations, and talent acquisition insights.
Keep your responses helpful, well-structured with markdown, professional, and concise.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}\n\nHyrBot Reply:` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 700 }
        })
      }
    );
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "HyrBot evaluated your prompt successfully.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error('HyrBot API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
