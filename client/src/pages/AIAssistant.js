import "../styles/AIAssistant.css";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import API from "../api";
import ReactMarkdown from "react-markdown";

const STARTERS = [
  "Explain the Pythagorean theorem",
  "How do I write a good essay introduction?",
  "Help me study for a biology exam",
  "What is the water cycle?",
];

const AIAssistant = () => {
  const userId = localStorage.getItem("user_id");

  const [sessions, setSessions]       = useState([]);
  const [activeSession, setActive]    = useState(null);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [sidebarOpen, setSidebar]     = useState(true);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const bottomRef  = useRef(null);
  const fileRef    = useRef(null);

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const fetchSessions = async () => {
    const res = await axios.get(`${API}/chat/sessions?user_id=${userId}`);
    setSessions(res.data);
  };

  const newChat = async () => {
    const res = await axios.post(`${API}/chat/sessions`, { user_id: userId, title: "New Chat" });
    const session = { id: res.data.id, title: "New Chat" };
    setSessions(prev => [session, ...prev]);
    setActive(session);
    setMessages([]);
  };

  const loadSession = async (session) => {
    setActive(session);
    const res = await axios.get(`${API}/chat/messages?session_id=${session.id}`);
    setMessages(res.data.map(m => ({ role: m.role, content: m.content })));
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    await axios.delete(`${API}/chat/sessions`, { data: { id } });
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSession?.id === id) { setActive(null); setMessages([]); }
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    let session = activeSession;
    if (!session) {
      const res = await axios.post(`${API}/chat/sessions`, { user_id: userId, title: userText.slice(0, 40) });
      session = { id: res.data.id, title: userText.slice(0, 40) };
      setActive(session);
      setSessions(prev => [session, ...prev]);
    }

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    await axios.post(`${API}/chat/messages`, { session_id: session.id, role: "user", content: userText });

    if (messages.length === 0) {
      const title = userText.slice(0, 45);
      await axios.put(`${API}/chat/sessions`, { id: session.id, title });
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, title } : s));
      setActive(prev => ({ ...prev, title }));
    }

    try {
      const res = await axios.post(`${API}/ai`, {
        mode: "chat",
        messages: newMessages.map(({ role, content }) => ({ role, content })),
      });
      const reply = res.data.reply;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      await axios.post(`${API}/chat/messages`, { session_id: session.id, role: "assistant", content: reply });
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${err.response?.data?.error || err.message}` }]);
    }
    setLoading(false);
  };

  // ── PDF Upload ───────────────────────────────────────────────────────────────
  const handlePdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    setPdfLoading(true);

    // Show a user message indicating the upload
    const userMsg = `📄 Summarise this PDF for me: **${file.name}**`;

    let session = activeSession;
    if (!session) {
      const res = await axios.post(`${API}/chat/sessions`, { user_id: userId, title: `PDF: ${file.name.slice(0,35)}` });
      session = { id: res.data.id, title: `PDF: ${file.name.slice(0,35)}` };
      setActive(session);
      setSessions(prev => [session, ...prev]);
    }

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    await axios.post(`${API}/chat/messages`, { session_id: session.id, role: "user", content: userMsg });

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await axios.post(`${API}/ai/pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const reply = `📄 **${res.data.filename}** (${res.data.pages} page${res.data.pages !== 1 ? "s" : ""})\n\n${res.data.reply}`;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      await axios.post(`${API}/chat/messages`, { session_id: session.id, role: "assistant", content: reply });
    } catch (err) {
      const errMsg = `❌ PDF Error: ${err.response?.data?.error || err.message}`;
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    }
    setPdfLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="ai-page">
      {/* Sidebar */}
      <div className={`ai-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-top">
          <button className="new-chat-btn" onClick={newChat}>+ New Chat</button>
          <button className="toggle-sidebar" onClick={() => setSidebar(!sidebarOpen)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {sidebarOpen && (
          <div className="session-list">
            {sessions.length === 0 && <p className="no-sessions">No chats yet</p>}
            {sessions.map(s => (
              <div key={s.id} className={`session-item ${activeSession?.id === s.id ? "active" : ""}`} onClick={() => loadSession(s)}>
                <span className="session-title">💬 {s.title}</span>
                <button className="del-session" onClick={e => deleteSession(e, s.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="ai-main">
        <div className="ai-header">
          <h1>🤖 AI Study Assistant</h1>
          <p>Powered by Groq — chat or upload a PDF to summarise</p>
        </div>

        {!activeSession && messages.length === 0 && (
          <div className="starters">
            {STARTERS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} className="starter-btn">{s}</button>
            ))}
          </div>
        )}

        <div className="chat-window">
          {messages.length === 0 && activeSession && <p className="empty-chat">Start the conversation!</p>}
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="bubble">
                {m.role === "assistant" ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
              </div>
            </div>
          ))}
          {(loading || pdfLoading) && (
            <div className="message assistant">
              <div className="bubble typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handlePdf}
          />
          {/* PDF button */}
          <button
            className="pdf-btn"
            onClick={() => fileRef.current.click()}
            disabled={pdfLoading || loading}
            title="Upload PDF to summarise"
          >
            📄
          </button>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question or upload a PDF... (Enter to send)"
            rows={2}
          />
          <button onClick={() => sendMessage()} disabled={loading || pdfLoading || !input.trim()} className="send-btn">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
