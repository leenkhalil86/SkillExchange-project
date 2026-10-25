require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRouter      = require("./routes/auth");
const todosRouter     = require("./routes/todos");
const pomodoroRouter  = require("./routes/pomodoro");
const aiRouter        = require("./routes/ai");
const dashboardRouter = require("./routes/dashboard");
const chatRouter      = require("./routes/chat");
const notesRouter     = require("./routes/notes");
const plannerRouter   = require("./routes/planner");
const gradesRouter    = require("./routes/grades");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRouter);
app.use("/api/todos",     todosRouter);
app.use("/api/pomodoro",  pomodoroRouter);
app.use("/api/ai",        aiRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/chat",      chatRouter);
app.use("/api/notes",     notesRouter);
app.use("/api/planner",   plannerRouter);
app.use("/api/grades",    gradesRouter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "StudySmart server running ✅" }));

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Server running at http://localhost:${PORT}`);
  console.log(`📦  Database : ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  console.log(`🤖  AI key   : ${process.env.GROQ_API_KEY ? "✅ loaded" : "❌ MISSING — add it to .env"}\n`);
});
