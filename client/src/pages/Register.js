import "../styles/Register.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import API from "../api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/auth/register`, form);
      if (res.data.success) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join StudySmart today</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <input type="text" placeholder="Username" name="username" onChange={handleChange} required />
          </div>
          <div className="field">
            <input type="email" placeholder="Email" name="email" onChange={handleChange} required />
          </div>
          <div className="field">
            <input type="password" placeholder="Password" name="password" onChange={handleChange} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="register-btn" type="submit">Register</button>
        </form>
        <div className="extra">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
