import "../styles/GradeTracker.css";
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../api";

const SUBJECTS = ["Math","Science","Language","History","CS","Physics","Chemistry","Biology","Other"];
const TYPES    = ["exam","quiz","homework","project","other"];

const gradeColor = (pct) => {
  if (pct >= 85) return "#10b981";
  if (pct >= 70) return "#3b82f6";
  if (pct >= 55) return "#f59e0b";
  return "#ef4444";
};
const gradeLabel = (pct) => {
  if (pct >= 85) return "Excellent";
  if (pct >= 70) return "Good";
  if (pct >= 55) return "Average";
  return "Needs Work";
};

const GradeTracker = () => {
  const userId = localStorage.getItem("user_id");
  const [grades, setGrades]       = useState([]);
  const [selected, setSelected]   = useState(null); // selected subject
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm] = useState({ subject:"Math", assessment_name:"", grade:"", max_grade:100, type:"exam", date:"" });

  useEffect(() => { fetchGrades(); }, []);

  const fetchGrades = async () => {
    const res = await axios.get(`${API}/grades?user_id=${userId}`);
    setGrades(res.data);
  };

  const addGrade = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/grades`, { user_id: userId, ...form });
    setShowForm(false);
    setForm({ subject:"Math", assessment_name:"", grade:"", max_grade:100, type:"exam", date:"" });
    fetchGrades();
  };

  const deleteGrade = async (id) => {
    await axios.delete(`${API}/grades`, { data: { id } });
    setGrades(prev => prev.filter(g => g.id !== id));
  };

  // Group grades by subject
  const bySubject = grades.reduce((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = [];
    acc[g.subject].push(g);
    return acc;
  }, {});

  const subjectStats = Object.entries(bySubject).map(([subject, gs]) => {
    const avg = gs.reduce((sum, g) => sum + (g.grade / g.max_grade) * 100, 0) / gs.length;
    return { subject, grades: gs, avg: Math.round(avg) };
  }).sort((a, b) => b.avg - a.avg);

  const overallAvg = subjectStats.length
    ? Math.round(subjectStats.reduce((s, x) => s + x.avg, 0) / subjectStats.length) : 0;

  const detailGrades = selected ? (bySubject[selected] || []) : [];

  return (
    <div className="grades-page">
      <div className="grades-header">
        <div>
          <h1>📊 Grade Tracker</h1>
          <p>Track your academic performance across all subjects</p>
        </div>
        <button className="add-grade-btn" onClick={() => setShowForm(true)}>+ Add Grade</button>
      </div>

      {/* Summary cards */}
      <div className="grade-summary">
        <div className="summary-card overall">
          <div className="sc-icon">🎯</div>
          <div>
            <h3 style={{ color: gradeColor(overallAvg) }}>{overallAvg}%</h3>
            <p>Overall Average</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="sc-icon">📚</div>
          <div>
            <h3>{subjectStats.length}</h3>
            <p>Subjects</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="sc-icon">📝</div>
          <div>
            <h3>{grades.length}</h3>
            <p>Total Grades</p>
          </div>
        </div>
        {subjectStats[0] && (
          <div className="summary-card best">
            <div className="sc-icon">🏆</div>
            <div>
              <h3>{subjectStats[0].subject}</h3>
              <p>Best Subject ({subjectStats[0].avg}%)</p>
            </div>
          </div>
        )}
      </div>

      <div className="grades-body">
        {/* Subject cards */}
        <div className="subjects-panel">
          <h2>Subjects</h2>
          {subjectStats.length === 0 && <p className="no-grades">No grades yet. Click "+ Add Grade" to start!</p>}
          {subjectStats.map(({ subject, avg, grades: gs }) => (
            <div
              key={subject}
              className={`subject-card ${selected === subject ? "active" : ""}`}
              onClick={() => setSelected(selected === subject ? null : subject)}
            >
              <div className="sc-top">
                <span className="sc-name">{subject}</span>
                <span className="sc-avg" style={{ color: gradeColor(avg) }}>{avg}%</span>
              </div>
              <div className="sc-bar-track">
                <div className="sc-bar-fill" style={{ width: `${avg}%`, background: gradeColor(avg) }} />
              </div>
              <div className="sc-bottom">
                <span className="sc-label" style={{ color: gradeColor(avg) }}>{gradeLabel(avg)}</span>
                <span className="sc-count">{gs.length} grade{gs.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="detail-panel">
            <h2>{selected} — All Grades</h2>
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>%</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detailGrades.map(g => {
                  const pct = Math.round((g.grade / g.max_grade) * 100);
                  return (
                    <tr key={g.id}>
                      <td>{g.assessment_name}</td>
                      <td><span className={`type-badge ${g.type}`}>{g.type}</span></td>
                      <td><strong>{g.grade}/{g.max_grade}</strong></td>
                      <td>
                        <span className="pct-badge" style={{ background: gradeColor(pct) + "22", color: gradeColor(pct) }}>
                          {pct}%
                        </span>
                      </td>
                      <td>{g.date ? g.date.slice(0,10) : "—"}</td>
                      <td>
                        <button className="del-grade" onClick={() => deleteGrade(g.id)}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add grade modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>➕ Add Grade</h3>
            <form onSubmit={addGrade}>
              <select value={form.subject} onChange={e => setForm(p=>({...p,subject:e.target.value}))}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <input placeholder="Assessment name (e.g. Chapter 3 Quiz)" value={form.assessment_name}
                onChange={e => setForm(p=>({...p,assessment_name:e.target.value}))} required />
              <div className="form-row-2">
                <label>Your Grade
                  <input type="number" min="0" max="9999" step="0.5" placeholder="e.g. 85"
                    value={form.grade} onChange={e => setForm(p=>({...p,grade:e.target.value}))} required />
                </label>
                <label>Out of
                  <input type="number" min="1" max="9999" step="0.5" value={form.max_grade}
                    onChange={e => setForm(p=>({...p,max_grade:e.target.value}))} />
                </label>
              </div>
              <div className="form-row-2">
                <label>Type
                  <select value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label>Date
                  <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} />
                </label>
              </div>
              <div className="modal-btns">
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="save">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeTracker;
