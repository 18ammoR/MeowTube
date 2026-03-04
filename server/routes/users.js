const express = require("express");
const auth = require("../middleware/auth");
const { usersDB, videosDB, subscriptionsDB } = require("../config/db");

const router = express.Router();

// GET user profile + their videos
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  usersDB.findOne({ _id: userId }, (err, user) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!user) return res.status(404).json({ error: "User not found" });

    videosDB.find({ userId }).sort({ createdAt: -1 }).exec((vErr, videos) => {
      if (vErr) return res.status(500).json({ error: "DB error" });

      res.json({
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        subscribers: user.subscribers || 0,
        createdAt: user.createdAt,
        videos,
      });
    });
  });
});

// Subscribe/unsubscribe toggle
router.post("/:id/subscribe", auth, (req, res) => {
  const channelId = req.params.id;
  const subscriberId = req.user.id;

  if (channelId === subscriberId)
    return res.status(400).json({ error: "Cannot subscribe to yourself" });

  subscriptionsDB.findOne({ channelId, subscriberId }, (err, sub) => {
    if (err) return res.status(500).json({ error: "DB error" });

    if (sub) {
      // unsubscribe
      subscriptionsDB.remove({ _id: sub._id }, {}, (dErr) => {
        if (dErr) return res.status(500).json({ error: "DB error" });
        usersDB.update({ _id: channelId }, { $inc: { subscribers: -1 } }, {}, () => {
          usersDB.findOne({ _id: channelId }, (e2, u2) => {
            if (e2) return res.status(500).json({ error: "DB error" });
            res.json({ subscribed: false, subscribers: u2?.subscribers || 0 });
          });
        });
      });
    } else {
      // subscribe
      subscriptionsDB.insert(
        { channelId, subscriberId, createdAt: Date.now() },
        (iErr) => {
          if (iErr) return res.status(500).json({ error: "DB error" });
          usersDB.update({ _id: channelId }, { $inc: { subscribers: 1 } }, {}, () => {
            usersDB.findOne({ _id: channelId }, (e2, u2) => {
              if (e2) return res.status(500).json({ error: "DB error" });
              res.json({ subscribed: true, subscribers: u2?.subscribers || 0 });
            });
          });
        }
      );
    }
  });
});

module.exports = router;