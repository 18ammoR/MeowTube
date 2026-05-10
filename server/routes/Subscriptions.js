const express = require("express");
const auth = require("../middleware/auth");
const { subscriptionsDB, videosDB, usersDB } = require("../config/db");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const subs = await subscriptionsDB.find({ subscriberId: req.user.id });
    const channelIds = subs.map((s) => s.channelId);

    if (channelIds.length === 0) return res.json([]);

    const videos = await videosDB.find({ userId: { $in: channelIds } });
    videos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const users = await usersDB.find({ _id: { $in: channelIds } });
    const map = new Map(users.map((u) => [u._id, u.username]));

    res.json(
      videos.map((v) => ({
        ...v,
        uploaderName: map.get(v.userId) || "Unknown",
        likeCount: (v.likes || []).length,
        dislikeCount: (v.dislikes || []).length,
      }))
    );
  } catch (err) {
    console.error("GET SUBSCRIPTIONS ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;