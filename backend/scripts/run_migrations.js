require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function run() {
  const sqlPath = path.join(__dirname, "..", "sql", "schema.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("schema.sql not found at", sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  try {
    console.log("Running migrations...");
    await connection.query(sql);
    console.log("Migrations applied.");
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("Migration error", err);
    try {
      await connection.end();
    } catch (e) {}
    process.exit(1);
  }
}

run();
