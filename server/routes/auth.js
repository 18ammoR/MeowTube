const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { usersDB } = require("../config/db");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password)
    return res.status(400).json({ error: "username, email, password required" });

  usersDB.findOne({ $or: [{ username }, { email }] }, async (err, existing) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const doc = {
      username,
      email,
      password: hashed,
      avatar: "default-avatar.png",
      subscribers: 0,
      createdAt: Date.now(),
    };

    usersDB.insert(doc, (insErr, user) => {
      if (insErr) return res.status(500).json({ error: "DB insert error" });
      const token = signToken(user);
      res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  usersDB.findOne({ email }, async (err, user) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  });
});

module.exports = router;