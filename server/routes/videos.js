const express = require("express");
const auth = require("../middleware/auth");
const { videosDB, usersDB } = require("../config/db");
const { extractYouTubeId, thumbnailFromId } = require("../utils/youtube");

const router = express.Router();

async function requireOwner(req, res, next) {
  try {
    const { id } = req.params;
    const video = await videosDB.findOne({ _id: id });

    if (!video) return res.status(404).json({ error: "Video not found" });
    if (video.userId !== req.user.id)
      return res.status(403).json({ error: "Not owner" });

    req.video = video;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "DB error" });
  }
}

// GET all videos (search/filter)
router.get("/", async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;

    const query = {};
    if (category) query.category = category;

    let videos = await videosDB.find(query);
    videos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (search) {
      const s = String(search).toLowerCase();
      videos = videos.filter((v) =>
        String(v.title || "").toLowerCase().includes(s)
      );
    }

    const ids = [...new Set(videos.map((v) => v.userId).filter(Boolean))];
    const users = ids.length ? await usersDB.find({ _id: { $in: ids } }) : [];
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
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// GET single video
router.get("/:id", async (req, res) => {
  try {
    const video = await videosDB.findOne({ _id: req.params.id });
    if (!video) return res.status(404).json({ error: "Video not found" });

    const user = await usersDB.findOne({ _id: video.userId });

    res.json({
      ...video,
      uploaderName: user?.username || "Unknown",
      likeCount: (video.likes || []).length,
      dislikeCount: (video.dislikes || []).length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// POST create video (auth)
router.post("/", auth, async (req, res) => {
  try {
    const { youtubeUrl, title, description = "", category = "" } = req.body || {};
    if (!youtubeUrl || !title)
      return res.status(400).json({ error: "youtubeUrl and title required" });

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

    const doc = {
      userId: req.user.id,
      title,
      description,
      youtubeUrl,
      videoId,
      thumbnail: thumbnailFromId(videoId),
      category,
      views: 0,
      likes: [],
      dislikes: [],
      createdAt: Date.now(),
    };

    const video = await videosDB.insert(doc);
    res.status(201).json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert error" });
  }
});

// PUT update video (owner)
router.put("/:id", auth, requireOwner, async (req, res) => {
  try {
    const { title, description, category } = req.body || {};
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;

    await videosDB.update({ _id: req.params.id }, { $set: updates });
    const updated = await videosDB.findOne({ _id: req.params.id });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB update error" });
  }
});

// DELETE video (owner)
router.delete("/:id", auth, requireOwner, async (req, res) => {
  try {
    const n = await videosDB.remove({ _id: req.params.id }, { multi: false });
    res.json({ deleted: n });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB remove error" });
  }
});

// POST like/dislike toggle (auth)
router.post("/:id/like", auth, async (req, res) => {
  try {
    const { action } = req.body || {};
    if (!["like", "dislike"].includes(action))
      return res.status(400).json({ error: "action must be like or dislike" });

    const video = await videosDB.findOne({ _id: req.params.id });
    if (!video) return res.status(404).json({ error: "Video not found" });

    const uid = req.user.id;
    const likes = new Set(video.likes || []);
    const dislikes = new Set(video.dislikes || []);

    if (action === "like") {
      if (likes.has(uid)) likes.delete(uid);
      else likes.add(uid);
      dislikes.delete(uid);
    } else {
      if (dislikes.has(uid)) dislikes.delete(uid);
      else dislikes.add(uid);
      likes.delete(uid);
    }

    await videosDB.update(
      { _id: video._id },
      { $set: { likes: [...likes], dislikes: [...dislikes] } }
    );

    res.json({ likeCount: likes.size, dislikeCount: dislikes.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB update error" });
  }
});

// POST increment view count
router.post("/:id/view", async (req, res) => {
  try {
    await videosDB.update({ _id: req.params.id }, { $inc: { views: 1 } });
    const video = await videosDB.findOne({ _id: req.params.id });
    if (!video) return res.status(404).json({ error: "Video not found" });
    res.json({ views: video.views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB update error" });
  }
});

module.exports = router;