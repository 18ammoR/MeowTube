const express = require("express");
const auth = require("../middleware/auth");
const { subscriptionsDB, videosDB, usersDB } = require("../config/db");

const router = express.Router();

router.get("/", auth, (req, res) => {
  subscriptionsDB.find({ subscriberId: req.user.id }, (err, subs) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const channelIds = subs.map((s) => s.channelId);
    if (channelIds.length === 0) return res.json([]);

    videosDB
      .find({ userId: { $in: channelIds } })
      .sort({ createdAt: -1 })
      .exec((vErr, videos) => {
        if (vErr) return res.status(500).json({ error: "DB error" });

        usersDB.find({ _id: { $in: channelIds } }, (uErr, users) => {
          if (uErr) return res.status(500).json({ error: "DB error" });
          const map = new Map(users.map((u) => [u._id, u.username]));
          res.json(
            videos.map((v) => ({
              ...v,
              uploaderName: map.get(v.userId) || "Unknown",
            }))
          );
        });
      });
  });
});

module.exports = router;