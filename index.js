const express = require("express");
const path = require("path");
const pool = require("./db"); // PostgreSQL connection

const port = process.env.PORT || 5006;

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Home route
app.get("/", (req, res) => {
  console.log("Rendering homepage");
  res.render("pages/index");
});

// Database test route
app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "success",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Example route to show DB info in EJS page
app.get("/db-view", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.render("pages/db", {
      dbTime: result.rows[0].now,
    });
  } catch (error) {
    res.render("pages/db", {
      dbTime: "Database connection failed",
    });
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Keep alive timeout (Heroku / production safe)
server.keepAliveTimeout = 95 * 1000;

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
