import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NavBar.css";
import ReorderIcon from "@mui/icons-material/Reorder";
import { useTheme } from "../context/ThemeContext";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate  = useNavigate();
  const { dark, toggle } = useTheme();

  const close = () => setMenuOpen(false);
  const userId = localStorage.getItem("user_id");

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user");
    close();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/home" onClick={close}>
          <div className="logo">Study<span>Smart</span></div>
        </Link>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        {/* Dark mode toggle */}
        <button className="theme-toggle" onClick={toggle} title="Toggle dark mode">
          {dark ? "☀️" : "🌙"}
        </button>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✖" : <ReorderIcon style={{ fontSize:"32px" }} />}
        </button>
      </div>

      <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <Link to="/home"  onClick={close}>Home</Link>
        <Link to="/about" onClick={close}>About</Link>

        {!userId ? (
          <Link to="/login" onClick={close}>Login</Link>
        ) : (
          <>
            <Link to="/dashboard" onClick={close}>Dashboard</Link>
            <Link to="/planner"   onClick={close}>Planner</Link>
            <Link to="/pomodoro"  onClick={close}>Pomodoro</Link>
            <Link to="/todo"      onClick={close}>To-Do</Link>
            <Link to="/notes"     onClick={close}>Notes</Link>
            <Link to="/grades"    onClick={close}>Grades</Link>
            <Link to="/ai"        onClick={close}>AI</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
