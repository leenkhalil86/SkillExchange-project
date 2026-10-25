import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import API from "../api";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      if (res.data.success) {
        localStorage.setItem("user_id", String(res.data.user.id));
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your StudySmart account</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <input type="email" placeholder="Email" name="email" onChange={handleChange} required />
          </div>
          <div className="field">
            <input type="password" placeholder="Password" name="password" onChange={handleChange} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="login-btn" type="submit">Login</button>
        </form>
        <div className="extra">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
