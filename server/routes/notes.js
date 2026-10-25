const express = require("express");
const db      = require("../config/db");
const router  = express.Router();

// GET /api/notes?user_id=1
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
      [req.query.user_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/notes
router.post("/", async (req, res) => {
  try {
    const { user_id, title, content, subject } = req.body;
    const [r] = await db.execute(
      "INSERT INTO notes (user_id, title, content, subject) VALUES (?,?,?,?)",
      [user_id, title, content || "", subject || "General"]
    );
    res.json({ success: true, id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notes
router.put("/", async (req, res) => {
  try {
    const { id, title, content, subject, ai_summary } = req.body;
    await db.execute(
      "UPDATE notes SET title=?, content=?, subject=?, ai_summary=?, updated_at=NOW() WHERE id=?",
      [title, content, subject, ai_summary ?? null, id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/notes
router.delete("/", async (req, res) => {
  try {
    await db.execute("DELETE FROM notes WHERE id=?", [req.body.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
