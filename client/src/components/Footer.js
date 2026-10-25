import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <p>StudySmart &mdash; Your AI-Powered Study Companion</p>
      <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
    </div>
  );
};

export default Footer;
