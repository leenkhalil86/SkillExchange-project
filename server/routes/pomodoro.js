const express = require("express");
const db      = require("../config/db");
const router  = express.Router();

// GET /api/pomodoro?user_id=1
router.get("/", async (req, res) => {
  const { user_id } = req.query;
  const [rows] = await db.execute(
    "SELECT * FROM pomodoro_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    [user_id]
  );
  res.json(rows);
});

// POST /api/pomodoro  — save a completed session
router.post("/", async (req, res) => {
  const { user_id, type, duration } = req.body;
  await db.execute(
    "INSERT INTO pomodoro_sessions (user_id, type, duration) VALUES (?, ?, ?)",
    [user_id, type || "work", duration || 25]
  );
  res.json({ success: true });
});

module.exports = router;
