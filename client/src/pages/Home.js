import "../styles/Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  const userId = localStorage.getItem("user_id");

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-text">
          <h1>Study Smarter,<br />Not Harder</h1>
          <p>Your all-in-one AI-powered platform for focused studying, task management, and academic success.</p>
          {userId ? (
            <Link to="/dashboard"><button className="hero-btn">Go to Dashboard</button></Link>
          ) : (
            <Link to="/register"><button className="hero-btn">Get Started Free</button></Link>
          )}
        </div>
      </div>

      <div className="features">
        <h2>Everything You Need to Succeed</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⏱</div>
            <h3>Pomodoro Timer</h3>
            <p>Stay focused with the proven 25/5 technique. Track your study sessions and build productive habits.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Smart To-Do List</h3>
            <p>Organize tasks by priority and category. Let AI suggest priorities and break down complex assignments.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Study Assistant</h3>
            <p>Get instant help with homework, study strategies, math problems, and any academic question.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Dashboard</h3>
            <p>Track your study sessions, task completion rate, and stay on top of upcoming deadlines.</p>
          </div>
        </div>
      </div>

      <div className="cta">
        <h2>Ready to boost your grades?</h2>
        <p>Join thousands of students studying smarter every day.</p>
        {!userId && (
          <Link to="/register"><button className="cta-btn">Start for Free</button></Link>
        )}
      </div>
    </div>
  );
};

export default Home;
