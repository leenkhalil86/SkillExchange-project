const express  = require("express");
const axios    = require("axios");
const multer   = require("multer");
const pdfParse = require("pdf-parse");
const router   = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 }, // 15 MB max
  fileFilter: (_, file, cb) => {
    cb(null, file.mimetype === "application/pdf");
  },
});

// ── Helper: call Groq ──────────────────────────────────────────────────────────
const callGroq = async (systemPrompt, messages, maxTokens = 1024) => {
  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
    ],
    max_tokens: maxTokens,
  };

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    payload,
    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
  );
  return response.data.choices[0].message.content;
};

// ── POST /api/ai  (chat + suggest) ────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { mode = "chat", messages = [] } = req.body;
  if (!messages.length) return res.status(400).json({ error: "No messages provided" });

  const systemPrompt =
    mode === "suggest"
      ? `You are a smart academic task analyser.
When given a task title and description respond ONLY with a valid JSON object — no extra text — in this exact shape:
{"priority":"low or medium or high","suggestion":"one short actionable sentence","steps":["step 1","step 2","step 3"]}`
      : `You are a helpful AI study assistant for students.
Help with homework, exam prep, math, science, essay writing, time management, and any academic topic.
Be concise, friendly, and encouraging. Format answers clearly.`;

  try {
    const reply = await callGroq(systemPrompt, messages);
    res.json({ reply });
  } catch (err) {
    const details = err.response?.data?.error?.message || err.message;
    console.error("Groq error:", details);
    res.status(500).json({ error: details });
  }
});

// ── POST /api/ai/pdf  (upload + summarise) ────────────────────────────────────
router.post("/pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

  try {
    // Extract text from the PDF buffer
    const data = await pdfParse(req.file.buffer);
    const text = data.text.trim();

    if (!text) return res.status(400).json({ error: "Could not extract text from PDF. It may be a scanned image." });

    // Truncate to avoid token limits (~12 000 chars ≈ 3 000 tokens)
    const truncated = text.length > 12000 ? text.slice(0, 12000) + "\n\n[... document truncated ...]" : text;

    const systemPrompt = `You are an expert academic summariser.
Summarise the provided document clearly with:
- A short overview (2-3 sentences)
- Key points as bullet points
- Important terms or concepts
- A concluding takeaway
Format nicely with markdown.`;

    const reply = await callGroq(systemPrompt, [{ role: "user", content: `Summarise this document:\n\n${truncated}` }], 2048);
    res.json({ reply, pages: data.numpages, filename: req.file.originalname });
  } catch (err) {
    console.error("PDF error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
