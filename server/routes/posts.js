const express = require("express");
const auth = require("../middleware/auth");
const { postsDB, usersDB } = require("../config/db");

const router = express.Router();

// GET all posts
router.get("/", async (req, res) => {
  try {
    let posts = await postsDB.find({});
    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json(posts);
  } catch (err) {
    console.error("GET POSTS ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// GET posts by user
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await postsDB.find({ userId: req.params.userId });
    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json(posts);
  } catch (err) {
    console.error("GET USER POSTS ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// CREATE post
router.post("/", auth, async (req, res) => {
  try {
    const { text, visibility = "Public" } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "Post text is required" });
    }

    const user = await usersDB.findOne({ _id: req.user.id });

    const post = await postsDB.insert({
      userId: req.user.id,
      username: user?.username || req.user.username || "Unknown",
      text: String(text).trim(),
      visibility,
      likes: [],
      comments: [],
      createdAt: Date.now(),
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    res.status(500).json({ error: "DB insert error" });
  }
});

// DELETE post owner only
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await postsDB.findOne({ _id: req.params.id });

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.userId !== req.user.id) {
      return res.status(403).json({ error: "Not owner" });
    }

    const deleted = await postsDB.remove({ _id: req.params.id }, { multi: false });

    res.json({ deleted });
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    res.status(500).json({ error: "DB remove error" });
  }
});

module.exports = router;