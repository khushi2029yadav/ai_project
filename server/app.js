const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_project";

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required; set it in server/.env");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});