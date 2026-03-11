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
// WAIT FOR DATABASE CONNECTION
// ========================================

async function waitForDB() {

  while (true) {

    try {

      const res = await pool.query("SELECT NOW()");
      console.log("Connected to PostgreSQL:", res.rows[0].now);

      break;

    } catch (err) {

      console.log("Waiting for PostgreSQL...");
      await new Promise(resolve => setTimeout(resolve, 3000));

    }

  }

}


// ========================================
// CREATE USERS TABLE
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


// ========================================
// ROUTES
// ========================================

// HOME
app.get("/", (req, res) => {
  res.render("pages/index");
});


// DB TEST
app.get("/db", async (req, res) => {

  try {

    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "connected",
      time: result.rows[0].now
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


// ========================================
// SIGNUP
// ========================================

app.get("/signup", (req, res) => {
  res.render("pages/signup");
});

app.post("/signup", async (req, res) => {

  const { name, email, password } = req.body;

  try {

    const result = await pool.query(
      "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, password]
    );

    console.log("User inserted:", result.rows[0]);

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
// LOGIN
// ========================================

app.get("/login", (req, res) => {
  res.render("pages/login");
});

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
// USERS PAGE
// ========================================

app.get("/users", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM users ORDER BY id DESC"
    );

    res.render("pages/users", { users: result.rows });

  } catch (err) {

    console.error("Users fetch error:", err.message);
    res.send("Error loading users");

  }

});


// ========================================
// START SERVER
// ========================================

async function startServer() {

  await waitForDB();
  await createTable();

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });

}

startServer();


// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
