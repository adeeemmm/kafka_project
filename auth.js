const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash]
    );

    res.status(201).json({ status: "account created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "login failed" });
  }
});

module.exports = router;
