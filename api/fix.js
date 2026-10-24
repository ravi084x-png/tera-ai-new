export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sirf POST chalega" });
  }

  const { text, mode } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: "Text nahi mila" });
  }

  const rules = {
    grammar: "Fix the grammar and tense.",
    spelling: "Fix only the spelling mistakes.",
    punctuation: "Add correct punctuation and capital letters only.",
    rewrite: "Rewrite the text to be clear and natural.",
  };

  const prompt =
    rules[mode] +
    " Keep the SAME language as the input (English, Hindi or Hinglish). " +
    "Do NOT change the meaning. If unsure, keep the original words. " +
    "Reply with ONLY the corrected text, nothing else.\n\nText:\n" +
    text;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const d = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: d.error?.message || "API error" });
    }
    res.status(200).json({ result: d.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
