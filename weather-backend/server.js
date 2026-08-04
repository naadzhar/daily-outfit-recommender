const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware harus di atas SEBELUM route
app.use(cors());
app.use(express.json());

// Route
const masterRoutes = require("./routes/master");
app.use("/api", masterRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Weather backend jalan" });
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});