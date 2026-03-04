const express = require("express");
const auth = require("../middleware/auth");
const { commentsDB } = require("../config/db");

const router = express.Router();

// GET comments for a video
router.get("/videos/:id/comments", (req, res) => {
  commentsDB.find({ videoId: req.params.id }).sort({ createdAt: -1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(
      docs.map((c) => ({
        ...c,
        likeCount: (c.likes || []).length,
      }))
    );
  });
});

// POST add comment
router.post("/videos/:id/comments", auth, (req, res) => {
  const { text } = req.body || {};
  if (!text || !String(text).trim())
    return res.status(400).json({ error: "text required" });

  const doc = {
    videoId: req.params.id,
    userId: req.user.id,
    username: req.user.username,
    text: String(text).trim(),
    likes: [],
    createdAt: Date.now(),
  };

  commentsDB.insert(doc, (err, comment) => {
    if (err) return res.status(500).json({ error: "DB insert error" });
    res.status(201).json(comment);
  });
});

// DELETE own comment
router.delete("/comments/:id", auth, (req, res) => {
  commentsDB.findOne({ _id: req.params.id }, (err, c) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!c) return res.status(404).json({ error: "Comment not found" });
    if (c.userId !== req.user.id) return res.status(403).json({ error: "Not owner" });

    commentsDB.remove({ _id: c._id }, {}, (dErr, n) => {
      if (dErr) return res.status(500).json({ error: "DB remove error" });
      res.json({ deleted: n });
    });
  });
});

// Like/unlike a comment
router.post("/comments/:id/like", auth, (req, res) => {
  commentsDB.findOne({ _id: req.params.id }, (err, c) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!c) return res.status(404).json({ error: "Comment not found" });

    const uid = req.user.id;
    const likes = new Set(c.likes || []);
    if (likes.has(uid)) likes.delete(uid);
    else likes.add(uid);

    commentsDB.update({ _id: c._id }, { $set: { likes: [...likes] } }, {}, (uErr) => {
      if (uErr) return res.status(500).json({ error: "DB update error" });
      res.json({ likeCount: likes.size });
    });
  });
});

module.exports = router;