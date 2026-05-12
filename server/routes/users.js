const express = require("express");
const auth = require("../middleware/auth");
const { usersDB, videosDB } = require("../config/db");

const router = express.Router();

// GET user profile + their videos
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await usersDB.findOne({ _id: userId });

    if (!user) return res.status(404).json({ error: "User not found" });

    const videos = await videosDB.find({ userId });
    videos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const subscribersArray = Array.isArray(user.subscribers)
      ? user.subscribers
      : [];

    const subscriptionsArray = Array.isArray(user.subscriptions)
      ? user.subscriptions
      : [];

    res.json({
      id: user._id,
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
      subscribers: subscribersArray.length,
      subscriptions: subscriptionsArray,
      createdAt: user.createdAt,
      videos,
    });
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// POST /api/users/:id/subscribe
router.post("/:id/subscribe", auth, async (req, res) => {
  try {
    const targetUserId = req.params.id; // uploader/channel owner
    const currentUserId = req.user.id; // logged-in user

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: "You cannot subscribe to yourself" });
    }

    const targetUser = await usersDB.findOne({ _id: targetUserId });
    const currentUser = await usersDB.findOne({ _id: currentUserId });

    if (!targetUser) return res.status(404).json({ error: "User not found" });
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const targetSubscribersArray = Array.isArray(targetUser.subscribers)
      ? targetUser.subscribers
      : [];

    const currentSubscriptionsArray = Array.isArray(currentUser.subscriptions)
      ? currentUser.subscriptions
      : [];

    const targetSubscribers = new Set(targetSubscribersArray);
    const currentSubscriptions = new Set(currentSubscriptionsArray);

    let subscribed;

    if (targetSubscribers.has(currentUserId)) {
      targetSubscribers.delete(currentUserId);
      currentSubscriptions.delete(targetUserId);
      subscribed = false;
    } else {
      targetSubscribers.add(currentUserId);
      currentSubscriptions.add(targetUserId);
      subscribed = true;
    }

    await usersDB.update(
      { _id: targetUserId },
      {
        $set: {
          subscribers: [...targetSubscribers],
        },
      }
    );

    await usersDB.update(
      { _id: currentUserId },
      {
        $set: {
          subscriptions: [...currentSubscriptions],
        },
      }
    );

    res.json({
      subscribed,
      subscribers: targetSubscribers.size,
    });
  } catch (err) {
    console.error("SUBSCRIBE ERROR:", err);
    res.status(500).json({ error: "Subscribe failed" });
  }
});

module.exports = router;