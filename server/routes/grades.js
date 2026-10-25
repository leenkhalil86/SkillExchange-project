const express = require("express");
const db      = require("../config/db");
const router  = express.Router();

// GET /api/grades?user_id=1
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM grades WHERE user_id = ? ORDER BY subject, date DESC",
      [req.query.user_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/grades
router.post("/", async (req, res) => {
  try {
    const { user_id, subject, assessment_name, grade, max_grade, type, date } = req.body;
    const [r] = await db.execute(
      "INSERT INTO grades (user_id, subject, assessment_name, grade, max_grade, type, date) VALUES (?,?,?,?,?,?,?)",
      [user_id, subject, assessment_name, grade, max_grade || 100, type || "other", date || null]
    );
    res.json({ success: true, id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/grades
router.delete("/", async (req, res) => {
  try {
    await db.execute("DELETE FROM grades WHERE id = ?", [req.body.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
