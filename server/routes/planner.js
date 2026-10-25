const express = require("express");
const db      = require("../config/db");
const router  = express.Router();

// GET /api/planner?user_id=1&week_start=2024-01-01
router.get("/", async (req, res) => {
  try {
    const { user_id, week_start } = req.query;
    const [rows] = await db.execute(
      `SELECT * FROM study_plans
       WHERE user_id = ? AND plan_date >= ? AND plan_date < DATE_ADD(?, INTERVAL 7 DAY)
       ORDER BY plan_date, start_time`,
      [user_id, week_start, week_start]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/planner
router.post("/", async (req, res) => {
  try {
    const { user_id, title, subject, plan_date, start_time, duration } = req.body;
    const [r] = await db.execute(
      "INSERT INTO study_plans (user_id, title, subject, plan_date, start_time, duration) VALUES (?,?,?,?,?,?)",
      [user_id, title, subject || "General", plan_date, start_time || "09:00", duration || 60]
    );
    res.json({ success: true, id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/planner  (toggle complete)
router.put("/", async (req, res) => {
  try {
    const { id, completed } = req.body;
    await db.execute("UPDATE study_plans SET completed=? WHERE id=?", [completed, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/planner
router.delete("/", async (req, res) => {
  try {
    await db.execute("DELETE FROM study_plans WHERE id=?", [req.body.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
