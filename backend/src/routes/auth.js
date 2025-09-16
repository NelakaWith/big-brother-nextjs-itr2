const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { signToken } = require("../auth");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "username & password required" });
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (!rows || rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken({ id: user.id, username: user.username });
    res.json({ ok: true, token });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;
