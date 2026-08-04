const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET semua provinsi
router.get("/provinsi", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama_provinsi FROM provinsi ORDER BY nama_provinsi ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error ambil provinsi:", error);
    res.status(500).json({ error: "Gagal ambil data provinsi" });
  }
});

// GET kota berdasarkan provinsi_id
// Contoh: /api/kota?provinsi_id=2
router.get("/kota", async (req, res) => {
  const { provinsi_id } = req.query;

  if (!provinsi_id) {
    return res.status(400).json({ error: "provinsi_id wajib diisi" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, kota_id, nama_kota, latitude, longitude 
       FROM kota 
       WHERE provinsi_id = ? 
       ORDER BY nama_kota ASC`,
      [provinsi_id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error ambil kota:", error);
    res.status(500).json({ error: "Gagal ambil data kota" });
  }
});

module.exports = router;