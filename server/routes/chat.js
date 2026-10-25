const express = require("express");
const db      = require("../config/db");
const router  = express.Router();

// GET /api/chat/sessions?user_id=1
router.get("/sessions", async (req, res) => {
  try {
    const { user_id } = req.query;
    const [rows] = await db.execute(
      "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/sessions
router.post("/sessions", async (req, res) => {
  try {
    const { user_id, title } = req.body;
    const [result] = await db.execute(
      "INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)",
      [user_id, title || "New Chat"]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/chat/sessions
router.put("/sessions", async (req, res) => {
  try {
    const { id, title } = req.body;
    await db.execute("UPDATE chat_sessions SET title = ? WHERE id = ?", [title, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chat/sessions
router.delete("/sessions", async (req, res) => {
  try {
    const { id } = req.body;
    await db.execute("DELETE FROM chat_sessions WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/messages?session_id=1
router.get("/messages", async (req, res) => {
  try {
    const { session_id } = req.query;
    const [rows] = await db.execute(
      "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC",
      [session_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/messages
router.post("/messages", async (req, res) => {
  try {
    const { session_id, role, content } = req.body;
    const [result] = await db.execute(
      "INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)",
      [session_id, role, content]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
