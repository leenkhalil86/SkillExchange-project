const express = require("express");
const db      = require("../config/db");
const router  = express.Router();

// GET /api/todos?user_id=1
router.get("/", async (req, res) => {
  const { user_id } = req.query;
  const [rows] = await db.execute(
    "SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC",
    [user_id]
  );
  res.json(rows);
});

// POST /api/todos
router.post("/", async (req, res) => {
  const { user_id, title, description, priority, category, due_date, ai_suggestion } = req.body;
  if (!title) return res.status(400).json({ success: false, message: "Title is required" });

  const [result] = await db.execute(
    "INSERT INTO todos (user_id, title, description, priority, category, due_date, ai_suggestion) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [user_id, title, description || null, priority || "medium", category || "General", due_date || null, ai_suggestion || null]
  );
  res.json({ success: true, id: result.insertId });
});

// PUT /api/todos  — toggle complete
router.put("/", async (req, res) => {
  const { id, completed } = req.body;
  await db.execute("UPDATE todos SET completed = ? WHERE id = ?", [completed, id]);
  res.json({ success: true });
});

// DELETE /api/todos
router.delete("/", async (req, res) => {
  const { id } = req.body;
  await db.execute("DELETE FROM todos WHERE id = ?", [id]);
  res.json({ success: true });
});

module.exports = router;
