require("dotenv").config();
const db = require("../src/db");
const bcrypt = require("bcryptjs");

async function run() {
  const pwd = process.env.ADMIN_PASSWORD || "adminpass";
  const hash = await bcrypt.hash(pwd, 10);
  try {
    await db.query(
      "INSERT INTO users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)",
      ["admin", hash]
    );
    console.log("Admin user created/updated (username: admin)");
    process.exit(0);
  } catch (err) {
    console.error("Seed error", err);
    process.exit(1);
  }
}

run();
