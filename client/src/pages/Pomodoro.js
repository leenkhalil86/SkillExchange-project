import "../styles/Pomodoro.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import API from "../api";
import FocusMusic from "../components/FocusMusic";

const MODES = {
  work:        { label: "Focus",       minutes: 25, color: "#7c3aed" },
  short_break: { label: "Short Break", minutes: 5,  color: "#10b981" },
  long_break:  { label: "Long Break",  minutes: 15, color: "#3b82f6" },
};

const Pomodoro = () => {
  const userId           = localStorage.getItem("user_id");
  const [mode, setMode]  = useState("work");
  const [timeLeft, setTimeLeft]   = useState(MODES.work.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions]   = useState(0);
  const [history, setHistory]     = useState([]);
  const intervalRef = useRef(null);

  const totalTime = MODES[mode].minutes * 60;
  const radius    = 110;
  const circ      = 2 * Math.PI * radius;
  const progress  = (timeLeft / totalTime) * circ;

  useEffect(() => {
    axios
      .get(`${API}/pomodoro?user_id=${userId}`)
      .then((res) => setHistory(res.data))
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const handleSessionEnd = () => {
    const duration = MODES[mode].minutes;
    axios
      .post(`${API}/pomodoro`, { user_id: userId, type: mode, duration })
      .then(() => {
        setHistory((prev) => [
          { type: mode, duration, created_at: new Date().toISOString() },
          ...prev,
        ]);
      });
    if (mode === "work") setSessions((s) => s + 1);
    alert(`${MODES[mode].label} session complete!`);
  };

  const switchMode = (newMode) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  const todayWork = history.filter(
    (s) => s.type === "work" && s.created_at?.startsWith(new Date().toISOString().slice(0, 10))
  ).length;

  return (
    <div className="pomodoro-page">
      <h1>Pomodoro Timer</h1>

      <div className="mode-tabs">
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            className={`mode-tab ${mode === key ? "active" : ""}`}
            style={mode === key ? { background: val.color } : {}}
            onClick={() => switchMode(key)}
          >
            {val.label}
          </button>
        ))}
      </div>

      <div className="timer-wrapper">
        <svg width="270" height="270" viewBox="0 0 270 270">
          <circle cx="135" cy="135" r={radius} stroke="#e5e7eb" strokeWidth="14" fill="none" />
          <circle
            cx="135" cy="135" r={radius}
            stroke={MODES[mode].color}
            strokeWidth="14"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ - progress}
            strokeLinecap="round"
            transform="rotate(-90 135 135)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="timer-display">
          <span className="time-text">{mm}:{ss}</span>
          <span className="mode-label">{MODES[mode].label}</span>
        </div>
      </div>

      <div className="timer-controls">
        <button onClick={() => setIsRunning(!isRunning)} className="control-btn primary">
          {isRunning ? "⏸ Pause" : "▶ Start"}
        </button>
        <button onClick={reset} className="control-btn secondary">↺ Reset</button>
      </div>

      <div className="session-info">
        <span>Sessions today: <strong>{todayWork}</strong></span>
        <span>Total completed: <strong>{sessions}</strong></span>
      </div>

      <FocusMusic />

      {history.length > 0 && (
        <div className="history">
          <h3>Recent Sessions</h3>
          <ul>
            {history.slice(0, 8).map((s, i) => (
              <li key={i} className={`hist-item ${s.type}`}>
                <span>{MODES[s.type]?.label || s.type}</span>
                <span>{s.duration} min</span>
                <span className="hist-date">{new Date(s.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
