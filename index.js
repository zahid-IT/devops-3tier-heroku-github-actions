const express = require("express");
const path = require("path");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 5006;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


// ========================================
// DATABASE CONNECTION TEST
// ========================================

async function testDB() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL:", result.rows[0].now);
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
  }
}

testDB();


// ========================================
// CREATE USERS TABLE (AUTO)
// ========================================

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Users table ready");

  } catch (err) {
    console.error("Table creation error:", err.message);
  }
}

createTable();


// ========================================
// HOME PAGE
// ========================================

app.get("/", (req, res) => {
  console.log("Rendering homepage");
  res.render("pages/index");
});


// ========================================
// DATABASE TEST ROUTE
// ========================================

app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "connected",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});


// ========================================
// SIGNUP ROUTES
// ========================================

// show signup form
app.get("/signup", (req, res) => {
  res.render("pages/signup");
});


// insert user into database
app.post("/signup", async (req, res) => {

  const { name, email, password } = req.body;

  try {

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, password]
    );

    console.log("User inserted into DB:", result.rows[0]);

    res.redirect("/users");

  } catch (err) {

    console.error("Signup error:", err.message);

    if (err.code === "23505") {
      res.send("Email already exists");
    } else {
      res.send("Signup failed");
    }

  }

});


// ========================================
// LOGIN ROUTES
// ========================================

// show login form
app.get("/login", (req, res) => {
  res.render("pages/login");
});


// verify login
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (result.rows.length > 0) {

      console.log("Login success:", email);

      res.redirect("/users");

    } else {

      res.send("Invalid credentials");

    }

  } catch (err) {

    console.error("Login error:", err.message);
    res.send("Login error");

  }

});


// ========================================
// USERS LIST
// ========================================

app.get("/users", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM users ORDER BY id DESC"
    );

    res.render("pages/users", {
      users: result.rows
    });

  } catch (err) {

    console.error("Users fetch error:", err.message);
    res.send("Error loading users");

  }

});


// ========================================
// SERVER START
// ========================================

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});


// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Closing server...");
  server.close(() => process.exit(0));
});
