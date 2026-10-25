import "../styles/Dashboard.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const PIE_COLORS = ["#7c3aed","#10b981","#f59e0b","#3b82f6","#ef4444","#8b5cf6"];

const Dashboard = () => {
  const userId = localStorage.getItem("user_id");
  const user   = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/dashboard?user_id=${userId}`)
      .then(res => setStats(res.data))
      .catch(console.error);
  }, [userId]);

  const percent = stats && stats.total_todos > 0
    ? Math.round((stats.completed_todos / stats.total_todos) * 100) : 0;

  const pieData = stats?.task_by_category?.map(c => ({
    name: c.category, value: c.total
  })) || [];

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1>Welcome back, {user.username}! 👋</h1>
        <p>Here's your study overview for today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card pomodoro-stat">
          <div className="stat-icon">⏱</div>
          <div><h3>{stats ? stats.pomodoro_today : "—"}</h3><p>Pomodoros Today</p></div>
        </div>
        <div className="stat-card todo-stat">
          <div className="stat-icon">✅</div>
          <div><h3>{stats ? `${stats.completed_todos}/${stats.total_todos}` : "—"}</h3><p>Tasks Completed</p></div>
        </div>
        <div className="stat-card progress-stat">
          <div className="stat-icon">📊</div>
          <div><h3>{percent}%</h3><p>Completion Rate</p></div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-card">
          <h2>📈 Pomodoros — Last 7 Days</h2>
          {stats?.weekly_pomodoros?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.weekly_pomodoros} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                <XAxis dataKey="day" tick={{ fontSize:12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#7c3aed" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="no-data">No sessions recorded yet</p>}
        </div>

        <div className="chart-card">
          <h2>🗂 Tasks by Category</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="no-data">No tasks yet</p>}
        </div>
      </div>

      {/* Bottom */}
      <div className="dash-bottom">
        <div className="upcoming-tasks">
          <h2>📋 Upcoming Tasks</h2>
          {stats && stats.upcoming.length > 0 ? (
            <ul>
              {stats.upcoming.map(t => (
                <li key={t.id} className={`priority-${t.priority}`}>
                  <span>{t.title}</span>
                  {t.due_date && <span className="due">{t.due_date}</span>}
                </li>
              ))}
            </ul>
          ) : <p className="empty">No upcoming tasks. <Link to="/todo">Add some!</Link></p>}
        </div>

        <div className="quick-links">
          <h2>⚡ Quick Access</h2>
          <Link to="/planner"  className="quick-btn planner-btn">📅 Study Planner</Link>
          <Link to="/pomodoro" className="quick-btn timer-btn">⏱ Start Pomodoro</Link>
          <Link to="/todo"     className="quick-btn todo-btn">✅ Manage Tasks</Link>
          <Link to="/notes"    className="quick-btn notes-btn">📝 Smart Notes</Link>
          <Link to="/ai"       className="quick-btn ai-btn">🤖 Ask AI</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
