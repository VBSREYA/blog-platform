const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const localOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    const isAllowedOrigin =
      !origin ||
      localOrigins.includes(origin) ||
      configuredOrigins.includes(origin) ||
      configuredOrigins.length === 0;

    if (isAllowedOrigin) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", require("./routes/users"));
app.use("/api/profile", require("./routes/profile"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
