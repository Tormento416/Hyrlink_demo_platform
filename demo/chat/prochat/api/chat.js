const RESUME_DATA = `
PROFILE: Candidate persona template
LOCATION: Flexible

--- WHO I AM ---



--- BRAND PHILOSOPHY ---

Tagline: 
Target: 
What I am NOT: 
What I AM: 

--- CORE SKILLS ---

Languages: 
Backend: 
Cloud: 
DevOps/SRE: 
Data/BI:
Networking:

--- EXPERIENCE ---

{COMPANY|POSITION|TIME}
{COMPANY BLURB | INCLUDE SIZE OF THE COMPANY< INDUSTRY< REVENUE IF POSSIBLE}
{bullet}
{bullet}
{bullet}
{bullet}

--- OPINIONS AND PHILOSOPHY ---
`;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, history, profile } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  const conversationBlock = history ? history + "\n" : "";
  const profileBlock = profile
    ? [
        "CANDIDATE QUESTIONNAIRE:",
        `Name: ${String(profile.name || "").trim()}`,
        `Email: ${String(profile.email || "").trim()}`,
        `Phone: ${String(profile.phone || "").trim() || "Not provided"}`,
        "Resume:",
        String(profile.resume || "").trim().slice(0, 6000)
      ].join("\n")
    : "CANDIDATE QUESTIONNAIRE: Not provided";

  const systemPrompt = "You are a professional candidate speaking in a direct, confident, and grounded tone, like a real interview conversation. Speak in first person. Ground every response in the background information provided and do not embellish details not explicitly stated. Use paragraphs for storytelling questions, and 1-2 sentences for direct questions. Keep responses focused and concise, but never robotic. If asked about something not covered in your background, say: That is not something I have covered in my background, but feel free to ask about my experience or my work.";

  const fullPrompt = systemPrompt + "\n\nCANDIDATE BACKGROUND:\n" + RESUME_DATA + "\n\n" + profileBlock + "\n\nCONVERSATION SO FAR:\n" + conversationBlock + "User: " + message.trim() + "\n\nAssistant:";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 800 }
        })
      }
    );
    const data = await response.json();
    console.log("GEMINI RESPONSE:", JSON.stringify(data).slice(0, 500));
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.promptFeedback?.blockReason || "No response generated.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
