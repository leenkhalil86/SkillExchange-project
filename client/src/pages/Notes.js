import "../styles/Notes.css";
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../api";
import ReactMarkdown from "react-markdown";

const SUBJECTS = ["General","Math","Science","Language","History","CS","Other"];

const Notes = () => {
  const userId = localStorage.getItem("user_id");
  const [notes, setNotes]           = useState([]);
  const [active, setActive]         = useState(null);
  const [form, setForm]             = useState({ title:"", content:"", subject:"General" });
  const [aiLoading, setAiLoading]   = useState(false);
  const [quizData, setQuizData]     = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    const res = await axios.get(`${API}/notes?user_id=${userId}`);
    setNotes(res.data);
  };

  const newNote = () => {
    setActive(null);
    setForm({ title: "", content: "", subject: "General" });
    setQuizData(null);
    setShowSummary(false);
  };

  const openNote = (n) => {
    setActive(n);
    setForm({ title: n.title, content: n.content, subject: n.subject });
    setQuizData(null);
    setShowSummary(false);
    setQuizResult(null);
  };

  const saveNote = async () => {
    if (!form.title.trim()) { alert("Add a title"); return; }
    if (active) {
      await axios.put(`${API}/notes`, { id: active.id, ...form, ai_summary: active.ai_summary });
      setNotes(prev => prev.map(n => n.id === active.id ? { ...n, ...form } : n));
      setActive(prev => ({ ...prev, ...form }));
    } else {
      const res = await axios.post(`${API}/notes`, { user_id: userId, ...form });
      const newN = { id: res.data.id, ...form, ai_summary: null, created_at: new Date().toISOString() };
      setNotes(prev => [newN, ...prev]);
      setActive(newN);
    }
    alert("Saved ✅");
    fetchNotes();
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    await axios.delete(`${API}/notes`, { data: { id } });
    setNotes(prev => prev.filter(n => n.id !== id));
    if (active?.id === id) newNote();
  };

  const aiSummarize = async () => {
    if (!form.content.trim()) { alert("Write some content first"); return; }
    setAiLoading(true);
    try {
      const res = await axios.post(`${API}/ai`, {
        mode: "chat",
        messages: [{ role: "user", content: `Summarize these study notes in 3-5 bullet points:\n\n${form.content}` }]
      });
      const summary = res.data.reply;
      if (active) {
        await axios.put(`${API}/notes`, { id: active.id, ...form, ai_summary: summary });
        setActive(prev => ({ ...prev, ai_summary: summary }));
      }
      setShowSummary(true);
      setActive(prev => prev ? { ...prev, ai_summary: summary } : null);
    } catch { alert("AI error"); }
    setAiLoading(false);
  };

  const aiQuiz = async () => {
    if (!form.content.trim()) { alert("Write some content first"); return; }
    setAiLoading(true);
    setQuizData(null);
    setQuizResult(null);
    try {
      const res = await axios.post(`${API}/ai`, {
        mode: "chat",
        messages: [{
          role: "user",
          content: `Based on these notes, generate 3 multiple choice questions. Respond ONLY with valid JSON:
{"questions":[{"q":"question text","options":["A","B","C","D"],"answer":0}]}

Notes:
${form.content}`
        }]
      });
      const raw = res.data.reply.match(/\{[\s\S]*\}/)?.[0];
      if (raw) { setQuizData(JSON.parse(raw)); setQuizAnswers({}); }
      else alert("Could not parse quiz. Try again.");
    } catch { alert("AI error"); }
    setAiLoading(false);
  };

  const submitQuiz = () => {
    let score = 0;
    quizData.questions.forEach((q, i) => {
      if (parseInt(quizAnswers[i]) === q.answer) score++;
    });
    setQuizResult(score);
  };

  return (
    <div className="notes-page">
      {/* Sidebar */}
      <div className="notes-sidebar">
        <button className="new-note-btn" onClick={newNote}>+ New Note</button>
        <div className="note-list">
          {notes.length === 0 && <p className="no-notes">No notes yet</p>}
          {notes.map(n => (
            <div
              key={n.id}
              className={`note-item ${active?.id === n.id ? "active" : ""}`}
              onClick={() => openNote(n)}
            >
              <div className="note-item-top">
                <span className="note-item-title">{n.title}</span>
                <button className="del-note" onClick={e => { e.stopPropagation(); deleteNote(n.id); }}>✕</button>
              </div>
              <span className="note-subject-tag">{n.subject}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="notes-editor">
        <div className="editor-top">
          <input
            className="note-title-input"
            placeholder="Note title..."
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          />
          <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <textarea
          className="note-content"
          placeholder="Write your notes here..."
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
        />

        <div className="editor-actions">
          <button className="save-btn" onClick={saveNote}>💾 Save</button>
          <button className="ai-btn summarize" onClick={aiSummarize} disabled={aiLoading}>
            {aiLoading ? "..." : "✨ AI Summarize"}
          </button>
          <button className="ai-btn quiz" onClick={aiQuiz} disabled={aiLoading}>
            {aiLoading ? "..." : "🧠 AI Quiz Me"}
          </button>
        </div>

        {/* Summary */}
        {showSummary && active?.ai_summary && (
          <div className="ai-summary">
            <div className="summary-header">
              <strong>✨ AI Summary</strong>
              <button onClick={() => setShowSummary(false)}>✕</button>
            </div>
            <ReactMarkdown>{active.ai_summary}</ReactMarkdown>
          </div>
        )}

        {/* Quiz */}
        {quizData && (
          <div className="quiz-box">
            <h3>🧠 Quiz Time!</h3>
            {quizData.questions.map((q, i) => (
              <div key={i} className="quiz-question">
                <p><strong>Q{i+1}:</strong> {q.q}</p>
                <div className="quiz-options">
                  {q.options.map((opt, j) => (
                    <label
                      key={j}
                      className={`quiz-option
                        ${quizResult !== null && j === q.answer ? "correct" : ""}
                        ${quizResult !== null && parseInt(quizAnswers[i]) === j && j !== q.answer ? "wrong" : ""}
                      `}
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={j}
                        disabled={quizResult !== null}
                        onChange={() => setQuizAnswers(p => ({ ...p, [i]: j }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {quizResult === null ? (
              <button className="submit-quiz" onClick={submitQuiz}>Submit Quiz</button>
            ) : (
              <div className="quiz-score">
                Score: {quizResult}/{quizData.questions.length} {quizResult === quizData.questions.length ? "🎉 Perfect!" : "📚 Keep studying!"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
