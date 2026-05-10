const express = require("express");
const auth = require("../middleware/auth");
const { usersDB, videosDB, subscriptionsDB } = require("../config/db");

const router = express.Router();

// GET user profile + their videos
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await usersDB.findOne({ _id: userId });

    const videos = await videosDB.find({ userId });
    videos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

       res.json({
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      subscribers: user.subscribers || 0,
      createdAt: user.createdAt,
      videos,
    });
    } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// Subscribe/unsubscribe toggle
router.post("/:id/subscribe", auth, async (req, res) => {
  try {
    const channelId = req.params.id;
    const subscriberId = req.user.id;

  if (channelId === subscriberId) {
      return res.status(400).json({ error: "Cannot subscribe to yourself" });
    }

    const channel = await usersDB.findOne({ _id: channelId });
    if (!channel) return res.status(404).json({ error: "User not found" });

  const sub = await subscriptionsDB.findOne({ channelId, subscriberId });

    if (sub) {
      // unsubscribe
      await subscriptionsDB.remove({ _id: sub._id }, { multi: false });
      await usersDB.update({ _id: channelId }, { $inc: { subscribers: -1 } });
      const updated = await usersDB.findOne({ _id: channelId });
      return res.json({ subscribed: false, subscribers: updated?.subscribers || 0 });
    }
      // subscribe
    await subscriptionsDB.insert({ channelId, subscriberId, createdAt: Date.now() });
    await usersDB.update({ _id: channelId }, { $inc: { subscribers: 1 } });
    const updated = await usersDB.findOne({ _id: channelId });
    res.json({ subscribed: true, subscribers: updated?.subscribers || 0 });
  } catch (err) {
    console.error("TOGGLE SUBSCRIPTION ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;