import "../styles/StudyPlanner.css";
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../api";

const SUBJECTS = ["General","Math","Science","Language","History","CS","Other"];
const COLORS   = { Math:"#7c3aed", Science:"#0891b2", Language:"#b45309", History:"#dc2626", CS:"#16a34a", General:"#6b7280", Other:"#9333ea" };
const DAYS     = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Pure string-based date helpers (no timezone issues) ──────────────────────

/** Today as "YYYY-MM-DD" using LOCAL time */
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

/** Add n days to a "YYYY-MM-DD" string, return new "YYYY-MM-DD" string */
const addDays = (dateStr, n) => {
  // Use noon to avoid DST edge-cases
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

/** Get Monday of the week that contains dateStr */
const getMondayStr = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  const dow = d.getDay(); // 0=Sun … 6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

/** Format "YYYY-MM-DD" for display */
const fmtDisplay = (dateStr, opts) => new Date(dateStr + "T12:00:00").toLocaleDateString("en", opts);

// ─────────────────────────────────────────────────────────────────────────────

const StudyPlanner = () => {
  const userId = localStorage.getItem("user_id");

  // weekStart is always a plain "YYYY-MM-DD" string (Monday)
  const [weekStart, setWeekStart]     = useState(() => getMondayStr(todayStr()));
  const [plans, setPlans]             = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [selectedDay, setSelectedDay] = useState(""); // "YYYY-MM-DD" string
  const [form, setForm]               = useState({ title:"", subject:"General", start_time:"09:00", duration:60 });

  useEffect(() => { fetchPlans(); }, [weekStart]);

  const fetchPlans = async () => {
    const res = await axios.get(`${API}/planner?user_id=${userId}&week_start=${weekStart}`);
    setPlans(res.data);
  };

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, +7));
  const goToday  = () => setWeekStart(getMondayStr(todayStr()));

  const openForm = (dayStr) => { setSelectedDay(dayStr); setShowForm(true); };

  const addPlan = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/planner`, {
      user_id:    userId,
      plan_date:  selectedDay,   // already a clean "YYYY-MM-DD" string
      ...form,
    });
    setShowForm(false);
    setForm({ title:"", subject:"General", start_time:"09:00", duration:60 });
    fetchPlans();
  };

  const toggle = async (id, current) => {
    await axios.put(`${API}/planner`, { id, completed: current ? 0 : 1 });
    setPlans(prev => prev.map(p => p.id === id ? { ...p, completed: current ? 0 : 1 } : p));
  };

  const del = async (id) => {
    await axios.delete(`${API}/planner`, { data: { id } });
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  // Build the 7 day strings for this week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today    = todayStr();

  return (
    <div className="planner-page">
      <div className="planner-header">
        <h1>📅 Study Planner</h1>
        <div className="week-nav">
          <button onClick={prevWeek}>◀</button>
          <span>
            {fmtDisplay(weekDays[0], { month:"short", day:"numeric" })} –{" "}
            {fmtDisplay(weekDays[6], { month:"short", day:"numeric", year:"numeric" })}
          </span>
          <button onClick={nextWeek}>▶</button>
          <button className="today-btn" onClick={goToday}>Today</button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map((dayStr, i) => {
          const isToday  = dayStr === today;
          const dayPlans = plans.filter(p => (p.plan_date || "").slice(0,10) === dayStr);
          const dayNum   = new Date(dayStr + "T12:00:00").getDate();

          return (
            <div key={i} className={`cal-day ${isToday ? "today" : ""}`}>
              <div className="cal-day-header">
                <span className="day-name">{DAYS[i]}</span>
                <span className={`day-num ${isToday ? "today-num" : ""}`}>{dayNum}</span>
                <button className="add-plan-btn" onClick={() => openForm(dayStr)}>+</button>
              </div>

              <div className="day-plans">
                {dayPlans.map(p => (
                  <div
                    key={p.id}
                    className={`plan-item ${p.completed ? "done" : ""}`}
                    style={{ borderLeftColor: COLORS[p.subject] || "#7c3aed" }}
                  >
                    <div className="plan-item-top">
                      <input type="checkbox" checked={!!p.completed} onChange={() => toggle(p.id, p.completed)} />
                      <span className="plan-title">{p.title}</span>
                      <button className="del-plan" onClick={() => del(p.id)}>✕</button>
                    </div>
                    <div className="plan-meta">
                      <span>{p.start_time?.slice(0,5)}</span>
                      <span>{p.duration}min</span>
                      <span style={{ color: COLORS[p.subject] }}>{p.subject}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add session modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Study Session — {fmtDisplay(selectedDay, { weekday:"long", month:"short", day:"numeric" })}</h3>
            <form onSubmit={addPlan}>
              <input
                placeholder="What will you study?"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
              />
              <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <div className="form-row-2">
                <label>
                  Start time
                  <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
                </label>
                <label>
                  Duration (min)
                  <input type="number" min="15" max="480" step="15" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                </label>
              </div>
              <div className="modal-btns">
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="save">Add Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
