const express  = require("express");
const bcrypt   = require("bcryptjs");
const db       = require("../config/db");
const router   = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ success: false, message: "All fields are required" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );
    res.json({ success: true, message: "Registration successful!" });
  } catch (err) {
    const msg = err.code === "ER_DUP_ENTRY" ? "Email already exists" : "Server error";
    res.status(400).json({ success: false, message: msg });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "All fields are required" });

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    const user   = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    delete user.password;
    res.json({ success: true, message: "Login successful!", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
