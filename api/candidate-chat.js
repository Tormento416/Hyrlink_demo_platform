const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

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

  const modelsToTry = [GEMINI_MODEL, "gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.1-pro"];
  const uniqueModels = [...new Set(modelsToTry)];

  for (const model of uniqueModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return res.status(200).json({ reply });
      }
      if (data?.error) {
        console.warn(`HyrBot Gemini API model ${model} error:`, data.error);
      }
    } catch (err) {
      console.warn(`HyrBot Gemini API model ${model} fetch failed:`, err);
    }
  }

  return res.status(200).json({
    reply: null,
    message: "HyrBot Gemini API unavailable. Client fallback triggered."
  });
}
