const mysql = require("mysql2/promise");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const pool = mysql.createPool({
  host:     process.env.DB_HOST || "localhost",
  user:     process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "student_platform",
  waitForConnections: true,
  connectionLimit:    10,
  dateStrings:        true,   // Return DATE/DATETIME as "YYYY-MM-DD" strings, not JS Date objects
});

module.exports = pool;
