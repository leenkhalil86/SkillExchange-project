import "../styles/TodoList.css";
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../api";

const PRIORITIES = ["low", "medium", "high"];
const CATEGORIES = ["General", "Math", "Science", "Language", "History", "Assignment", "Exam", "Personal"];

const TodoList = () => {
  const userId = localStorage.getItem("user_id");

  const [todos, setTodos]       = useState([]);
  const [filter, setFilter]     = useState("all");
  const [priFilter, setPriFilter] = useState("all");
  const [form, setForm]         = useState({
    title: "", description: "", priority: "medium",
    category: "General", due_date: ""
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = () => {
    axios
      .get(`${API}/todos?user_id=${userId}`)
      .then((res) => setTodos(res.data))
      .catch(console.error);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const getAISuggestion = async () => {
    if (!form.title) { alert("Enter a task title first"); return; }
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await axios.post(`${API}/ai`, {
        mode: "suggest",
        messages: [{
          role: "user",
          content: `Task: ${form.title}\nDescription: ${form.description || "none"}`
        }]
      });
      const parsed = JSON.parse(res.data.reply);
      setAiSuggestion(parsed);
      setForm((prev) => ({ ...prev, priority: parsed.priority || prev.priority }));
    } catch (err) {
      alert("AI suggestion failed. Check your API key.");
    }
    setAiLoading(false);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await axios.post(`${API}/todos`, {
        user_id: userId,
        ...form,
        ai_suggestion: aiSuggestion ? aiSuggestion.suggestion : null
      });
      setForm({ title: "", description: "", priority: "medium", category: "General", due_date: "" });
      setAiSuggestion(null);
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = (id, current) => {
    axios
      .put(`${API}/todos`, { id, completed: current ? 0 : 1 })
      .then(() => setTodos((prev) =>
        prev.map((t) => t.id === id ? { ...t, completed: current ? 0 : 1 } : t)
      ));
  };

  const deleteTodo = (id) => {
    axios
      .delete(`${API}/todos`, { data: { id } })
      .then(() => setTodos((prev) => prev.filter((t) => t.id !== id)));
  };

  const filtered = todos.filter((t) => {
    const statusOk = filter === "all" || (filter === "active" ? !t.completed : t.completed);
    const priOk    = priFilter === "all" || t.priority === priFilter;
    return statusOk && priOk;
  });

  const done  = todos.filter((t) => t.completed).length;
  const total = todos.length;

  return (
    <div className="todo-page">
      <h1>Smart To-Do List</h1>
      <p className="todo-sub">Organize your tasks — let AI help prioritize them</p>

      <div className="todo-stats">
        <span>{done}/{total} completed</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: total ? `${(done/total)*100}%` : "0%" }} />
        </div>
      </div>

      {/* Add task form */}
      <form className="todo-form" onSubmit={addTodo}>
        <input
          name="title" value={form.title}
          onChange={handleChange}
          placeholder="Task title..." required
        />
        <input
          name="description" value={form.description}
          onChange={handleChange}
          placeholder="Description (optional)"
        />
        <div className="form-row">
          <select name="priority" value={form.priority} onChange={handleChange}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
          </select>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
        </div>

        <div className="form-actions">
          <button type="button" className="ai-suggest-btn" onClick={getAISuggestion} disabled={aiLoading}>
            {aiLoading ? "Thinking..." : "🤖 AI Suggest"}
          </button>
          <button type="submit" className="add-btn">+ Add Task</button>
        </div>

        {aiSuggestion && (
          <div className="ai-result">
            <strong>AI Suggestion:</strong> {aiSuggestion.suggestion}
            {aiSuggestion.steps && (
              <ul>{aiSuggestion.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
            )}
          </div>
        )}
      </form>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          {["all", "active", "completed"].map((f) => (
            <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="filter-group">
          {["all", ...PRIORITIES].map((p) => (
            <button key={p} className={`${priFilter === p ? "active" : ""} pri-${p}`} onClick={() => setPriFilter(p)}>
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="todo-list">
        {filtered.length === 0 ? (
          <p className="empty-msg">No tasks found. Add one above!</p>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className={`todo-item ${t.completed ? "done" : ""} border-${t.priority}`}>
              <input
                type="checkbox"
                checked={!!t.completed}
                onChange={() => toggleComplete(t.id, t.completed)}
              />
              <div className="todo-content">
                <span className="todo-title">{t.title}</span>
                {t.description && <span className="todo-desc">{t.description}</span>}
                {t.ai_suggestion && <span className="todo-ai">💡 {t.ai_suggestion}</span>}
                <div className="todo-meta">
                  <span className={`badge pri-${t.priority}`}>{t.priority}</span>
                  <span className="badge cat">{t.category}</span>
                  {t.due_date && <span className="badge due">📅 {t.due_date}</span>}
                </div>
              </div>
              <button className="del-btn" onClick={() => deleteTodo(t.id)}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
