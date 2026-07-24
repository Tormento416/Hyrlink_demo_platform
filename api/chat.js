const DEFAULT_RESUME_DATA = `
ELENA ROSTOVA
Boston, MA | (617) 555-0192 | elena.rostova@example.com | github.com/elena-rostova

SUMMARY:
Lead AI Data Architect and Distributed Systems Specialist with 9+ years of experience designing real-time streaming architectures, PyTorch LLM & Gemini AI RAG pipelines, and high-throughput data infrastructure supporting 10M+ daily active users. Expert in Python, C++, Apache Spark, Vector Databases, and cloud microservices.

EXPERIENCE:
Lead AI Data Architect | Enterprise Intelligence Lab (2021 - Present)
- Architected sub-100ms real-time vector search & RAG retrieval pipelines processing 50M+ document embeddings daily.
- Optimized PyTorch model serving pipelines using CUDA acceleration and TensorRT, reducing inference latency by 45%.
- Led a team of 8 Senior Machine Learning Engineers and Data Architects across distributed multi-cloud environments (AWS/GCP).

Senior Distributed Data Engineer | Cloud Analytics Platform (2017 - 2021)
- Built high-throughput Apache Spark and Kafka streaming data pipelines processing 2TB+ structured event logs per hour.
- Designed zero-downtime database schema migrations for PostgreSQL and Snowflake clusters.

EDUCATION & CORE SKILLS:
- M.S. in Computer Science (Distributed Systems) - MIT
- Core Competencies: PyTorch, CUDA Acceleration, Vector DBs (Qdrant, Milvus), Python, C++, Go, Apache Spark, Kafka, Distributed Systems, Multi-Tenant Cloud Security
`;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, history, profile } = req.body || {};
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

  const fullPrompt = systemPrompt + "\n\nCANDIDATE BACKGROUND:\n" + DEFAULT_RESUME_DATA + "\n\n" + profileBlock + "\n\nCONVERSATION SO FAR:\n" + conversationBlock + "User: " + message.trim() + "\n\nAssistant:";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      reply: null,
      message: "GEMINI_API_KEY environment variable not configured. Client will use intelligent offline engine."
    });
  }

  const modelsToTry = [GEMINI_MODEL, "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  const uniqueModels = [...new Set(modelsToTry)];

  for (const model of uniqueModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return res.status(200).json({ reply });
      }
      if (data?.error) {
        console.warn(`Gemini API model ${model} error:`, data.error);
      }
    } catch (err) {
      console.warn(`Gemini API model ${model} fetch failed:`, err);
    }
  }

  return res.status(200).json({
    reply: null,
    message: "Gemini API unavailable or key invalid. Client fallback triggered."
  });
}
