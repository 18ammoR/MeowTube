const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { usersDB } = require("../config/db");

const router = express.Router();

function signToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing in .env");
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, password required" });
    }

    const existing = await usersDB.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await usersDB.insert({
      username,
      email,
      password: hashed,
      avatar: "default-avatar.png",
      subscribers: 0,
      createdAt: Date.now(),
    });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const user = await usersDB.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

module.exports = router;