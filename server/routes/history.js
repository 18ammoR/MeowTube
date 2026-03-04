const express = require("express");
const auth = require("../middleware/auth");
const { historyDB } = require("../config/db");

const router = express.Router();

// Add watched video (called by frontend)
router.post("/:videoId", auth, (req, res) => {
  const userId = req.user.id;
  const videoId = req.params.videoId;

  // Keep it simple: insert a new record (or you can de-dupe later)
  historyDB.insert({ userId, videoId, watchedAt: Date.now() }, (err, doc) => {
    if (err) return res.status(500).json({ error: "DB insert error" });
    res.status(201).json(doc);
  });
});

// Get watch history
router.get("/", auth, (req, res) => {
  historyDB.find({ userId: req.user.id }).sort({ watchedAt: -1 }).exec((err, docs) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(docs);
  });
});

// Clear watch history
router.delete("/", auth, (req, res) => {
  historyDB.remove({ userId: req.user.id }, { multi: true }, (err, n) => {
    if (err) return res.status(500).json({ error: "DB remove error" });
    res.json({ deleted: n });
  });
});

module.exports = router;