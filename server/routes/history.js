const express = require("express");
const auth = require("../middleware/auth");
const { historyDB, videosDB, usersDB } = require("../config/db");

const router = express.Router();

// POST /api/history/:videoId
// Save watched video
router.post("/:videoId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.params.videoId;

    const video = await videosDB.findOne({ _id: videoId });
    if (!video) return res.status(404).json({ error: "Video not found" });

    const existing = await historyDB.findOne({ userId, videoId });

    if (existing) {
      await historyDB.update(
        { _id: existing._id },
        { $set: { watchedAt: Date.now() } }
      );

      return res.json({ ok: true, updated: true });
    }

    const item = await historyDB.insert({
      userId,
      videoId,
      watchedAt: Date.now(),
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("SAVE HISTORY ERROR:", err);
    res.status(500).json({ error: "Failed to save history" });
  }
});

// GET /api/history
// Get current user's watch history
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    let rows = await historyDB.find({ userId });
    rows.sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));

    const result = [];

    for (const row of rows) {
      const video = await videosDB.findOne({ _id: row.videoId });

      if (!video) continue;

      const uploader = await usersDB.findOne({ _id: video.userId });

      result.push({
        ...row,
        video: {
          ...video,
          uploaderName: uploader?.username || "Unknown",
        },
      });
    }

    res.json(result);
  } catch (err) {
    console.error("GET HISTORY ERROR:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

// DELETE /api/history
// Clear all history
router.delete("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await historyDB.remove({ userId }, { multi: true });

    res.json({ deleted });
  } catch (err) {
    console.error("CLEAR HISTORY ERROR:", err);
    res.status(500).json({ error: "Failed to clear history" });
  }
});

// DELETE /api/history/:videoId
// Remove one video from history
router.delete("/:videoId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.params.videoId;

    const deleted = await historyDB.remove(
      { userId, videoId },
      { multi: false }
    );

    res.json({ deleted });
  } catch (err) {
    console.error("DELETE HISTORY ITEM ERROR:", err);
    res.status(500).json({ error: "Failed to remove history item" });
  }
});

module.exports = router;