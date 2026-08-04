const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi saat startup
pool
  .getConnection()
  .then((conn) => {
    console.log("✓ Koneksi database sukses ke DB:", process.env.DB_NAME);
    conn.release();
  })
    .catch((err) => {
    console.error("✗ Gagal konek database:");
    console.error("  code   :", err.code);
    console.error("  errno  :", err.errno);
    console.error("  message:", err.message);
    console.error("  full   :", err);
  });

module.exports = pool;