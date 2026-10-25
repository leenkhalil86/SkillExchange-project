import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pomodoro from "./pages/Pomodoro";
import TodoList from "./pages/TodoList";
import AIAssistant from "./pages/AIAssistant";
import Notes from "./pages/Notes";
import StudyPlanner from "./pages/StudyPlanner";
import GradeTracker from "./pages/GradeTracker";

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return <Navigate to="/login" replace />;
  return children;
};

const App = () => (
  <ThemeProvider>
    <div className="App">
      <Router>
        <NavBar />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/home"      element={<Home />} />
          <Route path="/about"     element={<About />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/pomodoro"  element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
          <Route path="/todo"      element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
          <Route path="/ai"        element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
          <Route path="/notes"     element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/planner"   element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
          <Route path="/grades"    element={<ProtectedRoute><GradeTracker /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </Router>
    </div>
  </ThemeProvider>
);

export default App;
