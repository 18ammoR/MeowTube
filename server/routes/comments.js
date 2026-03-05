const express = require("express");
const auth = require("../middleware/auth");
const { commentsDB, usersDB } = require("../config/db");

const router = express.Router();

// GET /api/videos/:id/comments
router.get("/videos/:id/comments", async (req, res) => {
  try {
    const videoId = req.params.id;

    let comments = await commentsDB.find({ videoId });
    comments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // If older comments don't have username stored, hydrate it
    const missing = comments.filter((c) => !c.username && c.userId).map((c) => c.userId);
    const ids = [...new Set(missing)];
    let map = new Map();

    if (ids.length) {
      const users = await usersDB.find({ _id: { $in: ids } });
      map = new Map(users.map((u) => [u._id, u.username]));
    }

    res.json(
      comments.map((c) => ({
        ...c,
        username: c.username || map.get(c.userId) || "Unknown",
        likeCount: (c.likes || []).length,
      }))
    );
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// POST /api/videos/:id/comments  (auth)
router.post("/videos/:id/comments", auth, async (req, res) => {
  try {
    const videoId = req.params.id;
    const { text } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const user = await usersDB.findOne({ _id: req.user.id });

    const doc = await commentsDB.insert({
      videoId,
      userId: req.user.id,
      username: user?.username || "Unknown",
      text: String(text).trim(),
      likes: [],
      createdAt: Date.now(),
    });

    res.status(201).json({ ...doc, likeCount: 0 });
  } catch (err) {
    console.error("POST COMMENT ERROR:", err);
    res.status(500).json({ error: "DB insert error" });
  }
});

// POST /api/comments/:id/like  (auth) toggle like
router.post("/comments/:id/like", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await commentsDB.findOne({ _id: id });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const uid = req.user.id;
    const likes = new Set(comment.likes || []);

    if (likes.has(uid)) likes.delete(uid);
    else likes.add(uid);

    await commentsDB.update({ _id: id }, { $set: { likes: [...likes] } });

    res.json({ likeCount: likes.size });
  } catch (err) {
    console.error("LIKE COMMENT ERROR:", err);
    res.status(500).json({ error: "DB update error" });
  }
});

// DELETE /api/comments/:id  (auth) owner only
router.delete("/comments/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await commentsDB.findOne({ _id: id });
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId !== req.user.id)
      return res.status(403).json({ error: "Not owner" });

    const n = await commentsDB.remove({ _id: id }, { multi: false });
    res.json({ deleted: n });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ error: "DB remove error" });
  }
});

// PUT /api/comments/:id  (auth) owner only - edit comment text
router.put("/comments/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { text } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    const comment = await commentsDB.findOne({ _id: id });
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId !== req.user.id)
      return res.status(403).json({ error: "Not owner" });

    await commentsDB.update(
      { _id: id },
      { $set: { text: String(text).trim(), editedAt: Date.now() } }
    );

    const updated = await commentsDB.findOne({ _id: id });
    res.json({
      ...updated,
      likeCount: (updated.likes || []).length,
    });
  } catch (err) {
    console.error("EDIT COMMENT ERROR:", err);
    res.status(500).json({ error: "DB update error" });
  }
});

module.exports = router;