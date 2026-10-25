const express = require("express");
const db      = require("../config/db");
const router  = express.Router();

router.get("/", async (req, res) => {
  try {
    const { user_id } = req.query;
    const now   = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

    // Today's pomodoro count
    const [[{ count: pomodoro_today }]] = await db.execute(
      "SELECT COUNT(*) as count FROM pomodoro_sessions WHERE user_id=? AND type='work' AND DATE(created_at)=?",
      [user_id, today]
    );

    // Todo stats
    const [[todoStats]] = await db.execute(
      "SELECT COUNT(*) as total, SUM(completed) as done FROM todos WHERE user_id=?",
      [user_id]
    );

    // Upcoming tasks
    const [upcoming] = await db.execute(
      "SELECT id,title,priority,due_date FROM todos WHERE user_id=? AND completed=0 ORDER BY due_date ASC LIMIT 5",
      [user_id]
    );

    // Last 7 days pomodoro chart data
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7.push(d.toISOString().slice(0, 10));
    }
    const [pomRows] = await db.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM pomodoro_sessions
       WHERE user_id=? AND type='work' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)`,
      [user_id]
    );
    const pomMap = {};
    pomRows.forEach(r => { pomMap[r.date] = Number(r.count); });
    const weekly_pomodoros = last7.map(d => ({
      day: d.slice(5).replace("-", "/"),
      sessions: pomMap[d] || 0,
    }));

    // Tasks by category
    const [catRows] = await db.execute(
      "SELECT category, COUNT(*) as total, SUM(completed) as done FROM todos WHERE user_id=? GROUP BY category",
      [user_id]
    );
    const task_by_category = catRows.map(r => ({
      category: r.category,
      total:    Number(r.total),
      done:     Number(r.done) || 0,
    }));

    res.json({
      pomodoro_today:  Number(pomodoro_today),
      total_todos:     Number(todoStats.total)  || 0,
      completed_todos: Number(todoStats.done)   || 0,
      upcoming,
      weekly_pomodoros,
      task_by_category,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
