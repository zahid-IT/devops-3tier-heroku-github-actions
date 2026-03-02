const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "postgres_db",
  database: process.env.DB_NAME || "mydb",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("PostgreSQL connection error:", err.message));

module.exports = pool;
