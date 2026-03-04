const express = require("express");
const auth = require("../middleware/auth");
const { videosDB, usersDB } = require("../config/db");
const { extractYouTubeId, thumbnailFromId } = require("../utils/youtube");

const router = express.Router();

function requireOwner(req, res, next) {
  const { id } = req.params;
  videosDB.findOne({ _id: id }, (err, video) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!video) return res.status(404).json({ error: "Video not found" });
    if (video.userId !== req.user.id)
      return res.status(403).json({ error: "Not owner" });
    req.video = video;
    next();
  });
}

// GET all videos (search/filter)
router.get("/", (req, res) => {
  const { search = "", category = "" } = req.query;

  const query = {};
  if (category) query.category = category;

  videosDB.find(query).sort({ createdAt: -1 }).exec((err, videos) => {
    if (err) return res.status(500).json({ error: "DB error" });

    let result = videos;
    if (search) {
      const s = String(search).toLowerCase();
      result = result.filter((v) => String(v.title || "").toLowerCase().includes(s));
    }

    // Attach uploader name (simple approach: 1-by-1; OK for NeDB class projects)
    const ids = [...new Set(result.map((v) => v.userId))];
    usersDB.find({ _id: { $in: ids } }, (uErr, users) => {
      if (uErr) return res.status(500).json({ error: "DB error" });
      const map = new Map(users.map((u) => [u._id, u.username]));
      res.json(
        result.map((v) => ({
          ...v,
          uploaderName: map.get(v.userId) || "Unknown",
          likeCount: (v.likes || []).length,
          dislikeCount: (v.dislikes || []).length,
        }))
      );
    });
  });
});

// GET single video
router.get("/:id", (req, res) => {
  videosDB.findOne({ _id: req.params.id }, (err, video) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!video) return res.status(404).json({ error: "Video not found" });

    usersDB.findOne({ _id: video.userId }, (uErr, user) => {
      if (uErr) return res.status(500).json({ error: "DB error" });
      res.json({
        ...video,
        uploaderName: user?.username || "Unknown",
        likeCount: (video.likes || []).length,
        dislikeCount: (video.dislikes || []).length,
      });
    });
  });
});

// POST create video (auth)
router.post("/", auth, (req, res) => {
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

  videosDB.insert(doc, (err, video) => {
    if (err) return res.status(500).json({ error: "DB insert error" });
    res.status(201).json(video);
  });
});

// PUT update video (owner)
router.put("/:id", auth, requireOwner, (req, res) => {
  const { title, description, category } = req.body || {};
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;

  videosDB.update({ _id: req.params.id }, { $set: updates }, {}, (err) => {
    if (err) return res.status(500).json({ error: "DB update error" });
    videosDB.findOne({ _id: req.params.id }, (e2, updated) => {
      if (e2) return res.status(500).json({ error: "DB error" });
      res.json(updated);
    });
  });
});

// DELETE video (owner)
router.delete("/:id", auth, requireOwner, (req, res) => {
  videosDB.remove({ _id: req.params.id }, {}, (err, n) => {
    if (err) return res.status(500).json({ error: "DB remove error" });
    res.json({ deleted: n });
  });
});

// POST like/dislike toggle (auth)
// body: { action: "like" | "dislike" }
router.post("/:id/like", auth, (req, res) => {
  const { action } = req.body || {};
  if (!["like", "dislike"].includes(action))
    return res.status(400).json({ error: "action must be like or dislike" });

  videosDB.findOne({ _id: req.params.id }, (err, video) => {
    if (err) return res.status(500).json({ error: "DB error" });
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

    videosDB.update(
      { _id: video._id },
      { $set: { likes: [...likes], dislikes: [...dislikes] } },
      {},
      (uErr) => {
        if (uErr) return res.status(500).json({ error: "DB update error" });
        res.json({ likeCount: likes.size, dislikeCount: dislikes.size });
      }
    );
  });
});

// POST increment view count
router.post("/:id/view", (req, res) => {
  videosDB.update({ _id: req.params.id }, { $inc: { views: 1 } }, {}, (err) => {
    if (err) return res.status(500).json({ error: "DB update error" });
    videosDB.findOne({ _id: req.params.id }, (e2, video) => {
      if (e2) return res.status(500).json({ error: "DB error" });
      if (!video) return res.status(404).json({ error: "Video not found" });
      res.json({ views: video.views });
    });
  });
});

module.exports = router;