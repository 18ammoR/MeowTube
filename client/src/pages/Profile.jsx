import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Chip,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

import api, { getToken } from "../api";

const P = {
  bg: "#FFF7FB",
  surface: "#FFFFFF",
  surface2: "#FFF0F7",
  border: "#F6C6DA",
  text: "#3B2A34",
  subtext: "#7A5D6B",
  accent: "#FF7FB0",
  accent2: "#FFB6D3",
};

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);

  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;

  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;

  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;

  return `${Math.floor(mo / 12)}y ago`;
}

export default function Profile() {
  const nav = useNavigate();

  const token = getToken();
  const user = token ? decodeJwtPayload(token) : null;

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [videoAnchor, setVideoAnchor] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [postAnchor, setPostAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    if (!token || !user?.id) {
      setLoading(false);
      return;
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setErr("");

      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${user.id}`),
        api.get(`/posts/user/${user.id}`).catch(() => ({ data: [] })),
      ]);

      setProfile(profileRes.data);
      setVideos(profileRes.data?.videos || []);
      setPosts(postsRes.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function openVideoMenu(e, video) {
    e.preventDefault();
    e.stopPropagation();

    setSelectedVideo(video);
    setVideoAnchor(e.currentTarget);
  }

  function closeVideoMenu() {
    setVideoAnchor(null);
    setSelectedVideo(null);
  }

  function openPostMenu(e, post) {
    e.stopPropagation();

    setSelectedPost(post);
    setPostAnchor(e.currentTarget);
  }

  function closePostMenu() {
    setPostAnchor(null);
    setSelectedPost(null);
  }

  function openEditVideo() {
    if (!selectedVideo) return;

    setEditForm({
      title: selectedVideo.title || "",
      description: selectedVideo.description || "",
      category: selectedVideo.category || "",
    });

    setVideoAnchor(null);
    setEditOpen(true);
  }

  async function saveVideoEdit() {
    if (!selectedVideo) return;

    try {
      const res = await api.put(`/videos/${selectedVideo._id}`, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
      });

      setVideos((prev) =>
        prev.map((v) =>
          v._id === selectedVideo._id
            ? {
                ...v,
                ...res.data,
              }
            : v
        )
      );

      setSelectedVideo(null);
      setEditOpen(false);
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to edit video");
    }
  }

  async function deleteVideo() {
    if (!selectedVideo) return;

    const ok = confirm("Delete this video? This cannot be undone.");
    if (!ok) return;

    try {
      await api.delete(`/videos/${selectedVideo._id}`);

      setVideos((prev) => prev.filter((v) => v._id !== selectedVideo._id));
      closeVideoMenu();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to delete video");
    }
  }

  async function deletePost() {
    if (!selectedPost) return;

    const ok = confirm("Delete this post?");
    if (!ok) return;

    try {
      await api.delete(`/posts/${selectedPost._id}`);

      setPosts((prev) => prev.filter((p) => p._id !== selectedPost._id));
      closePostMenu();
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to delete post");
    }
  }

  if (!token) {
    return (
      <Box sx={{ bgcolor: P.bg, minHeight: "100vh", p: 3 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            border: `1px solid ${P.border}`,
            bgcolor: P.surface,
          }}
        >
          <Typography sx={{ color: P.text, fontWeight: 900 }}>
            Please login to view your profile.
          </Typography>

          <Link to="/login" style={{ textDecoration: "none" }}>
            <Button
              sx={{
                mt: 2,
                borderRadius: 999,
                bgcolor: P.accent,
                color: "white",
                fontWeight: 800,
                "&:hover": { bgcolor: P.accent },
              }}
            >
              Login
            </Button>
          </Link>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ bgcolor: P.bg, minHeight: "100vh", p: 3 }}>
        <Typography sx={{ color: P.subtext }}>Loading profile…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: P.bg, minHeight: "100vh", p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            sx={{
              mb: 2,
              borderColor: P.border,
              color: P.text,
              borderRadius: 999,
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            ← Back home
          </Button>
        </Link>

        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            border: `1px solid ${P.border}`,
            bgcolor: P.surface,
            mb: 3,
            boxShadow: "0 12px 30px rgba(255, 127, 176, 0.12)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: P.accent,
                fontSize: 36,
                fontWeight: 900,
              }}
            >
              {(user?.username || "U")[0].toUpperCase()}
            </Avatar>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: P.text }}>
                {user?.username}
              </Typography>

              <Typography sx={{ color: P.subtext }}>{user?.email}</Typography>

              <Typography sx={{ color: P.subtext, mt: 0.5 }}>
                {profile?.subscribers ?? 0} subscribers • {videos.length} videos
              </Typography>
            </Box>
          </Box>
        </Paper>

        {err && (
          <Typography sx={{ color: "crimson", mb: 2 }}>{err}</Typography>
        )}

        {/* YOUR VIDEOS */}
        <Typography variant="h5" sx={{ fontWeight: 900, color: P.text, mb: 2 }}>
          Your videos
        </Typography>

        {videos.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              border: `1px solid ${P.border}`,
              bgcolor: P.surface,
              mb: 4,
            }}
          >
            <Typography sx={{ color: P.subtext }}>
              No uploaded videos yet.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {videos.map((v) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={v._id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${P.border}`,
                    overflow: "hidden",
                    height: "100%",
                    bgcolor: P.surface,
                    boxShadow: "0 10px 25px rgba(255, 127, 176, 0.10)",
                  }}
                >
                  <Box
                    onClick={() => nav(`/watch/${v._id}`)}
                    sx={{ cursor: "pointer" }}
                  >
                    <CardMedia
                      component="img"
                      image={v.thumbnail}
                      sx={{
                        aspectRatio: "16 / 9",
                        objectFit: "cover",
                        bgcolor: P.surface2,
                      }}
                    />
                  </Box>

                  <CardContent>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            color: P.text,
                            fontWeight: 900,
                            lineHeight: 1.2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {v.title}
                        </Typography>

                        <Typography sx={{ color: P.subtext, fontSize: 13, mt: 0.5 }}>
                          {v.views ?? 0} views • {timeAgo(v.createdAt)}
                        </Typography>

                        {v.category && (
                          <Chip
                            label={v.category}
                            size="small"
                            sx={{
                              mt: 1,
                              bgcolor: P.surface2,
                              color: P.text,
                              border: `1px solid ${P.border}`,
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Box>

                      <IconButton
                        onClick={(e) => openVideoMenu(e, v)}
                        size="small"
                        sx={{
                          color: P.subtext,
                          "&:hover": { bgcolor: P.surface2 },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Divider sx={{ borderColor: P.border, my: 3 }} />

        {/* YOUR POSTS */}
        <Typography variant="h5" sx={{ fontWeight: 900, color: P.text, mb: 2 }}>
          Your posts
        </Typography>

        {posts.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              border: `1px solid ${P.border}`,
              bgcolor: P.surface,
            }}
          >
            <Typography sx={{ color: P.subtext }}>
              No posts yet. Create one from the Create menu ✨
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {posts.map((post) => (
              <Paper
                key={post._id}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: `1px solid ${P.border}`,
                  bgcolor: P.surface,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: P.surface2,
                      color: P.text,
                      border: `1px solid ${P.border}`,
                      fontWeight: 900,
                    }}
                  >
                    {(post.username || user?.username || "U")[0].toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontWeight: 900, color: P.text }}>
                        {post.username || user?.username}
                      </Typography>

                      <Typography sx={{ color: P.subtext, fontSize: 13 }}>
                        {timeAgo(post.createdAt)}
                      </Typography>

                      <Chip
                        label={post.visibility || "Public"}
                        size="small"
                        sx={{
                          bgcolor: P.surface2,
                          color: P.text,
                          border: `1px solid ${P.border}`,
                          fontWeight: 700,
                        }}
                      />

                      <Box sx={{ flex: 1 }} />

                      <IconButton
                        onClick={(e) => openPostMenu(e, post)}
                        size="small"
                        sx={{
                          color: P.subtext,
                          "&:hover": { bgcolor: P.surface2 },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Typography
                      sx={{
                        color: P.text,
                        whiteSpace: "pre-wrap",
                        mt: 1,
                        lineHeight: 1.5,
                      }}
                    >
                      {post.text}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* VIDEO MORE MENU */}
        <Menu
          anchorEl={videoAnchor}
          open={Boolean(videoAnchor)}
          onClose={closeVideoMenu}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 220,
              border: `1px solid ${P.border}`,
              boxShadow: "0 14px 35px rgba(255, 127, 176, 0.20)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              if (selectedVideo) nav(`/watch/${selectedVideo._id}`);
            }}
          >
            <ListItemIcon>
              <PlayCircleOutlineIcon sx={{ color: P.accent }} />
            </ListItemIcon>
            <ListItemText primary="Watch" />
          </MenuItem>

          <MenuItem onClick={openEditVideo}>
            <ListItemIcon>
              <EditOutlinedIcon sx={{ color: P.accent }} />
            </ListItemIcon>
            <ListItemText primary="Edit details" />
          </MenuItem>

          <MenuItem onClick={deleteVideo} sx={{ color: "#C0406D" }}>
            <ListItemIcon>
              <DeleteOutlineIcon sx={{ color: "#C0406D" }} />
            </ListItemIcon>
            <ListItemText primary="Delete video" />
          </MenuItem>
        </Menu>

        {/* POST MORE MENU */}
        <Menu
          anchorEl={postAnchor}
          open={Boolean(postAnchor)}
          onClose={closePostMenu}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 220,
              border: `1px solid ${P.border}`,
              boxShadow: "0 14px 35px rgba(255, 127, 176, 0.20)",
            },
          }}
        >
          <MenuItem disabled>
            <ListItemIcon>
              <ArticleOutlinedIcon sx={{ color: P.accent }} />
            </ListItemIcon>
            <ListItemText primary="Post options" />
          </MenuItem>

          <Divider sx={{ borderColor: P.border }} />

          <MenuItem onClick={deletePost} sx={{ color: "#C0406D" }}>
            <ListItemIcon>
              <DeleteOutlineIcon sx={{ color: "#C0406D" }} />
            </ListItemIcon>
            <ListItemText primary="Delete post" />
          </MenuItem>
        </Menu>

        {/* EDIT VIDEO DIALOG */}
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              border: `1px solid ${P.border}`,
              bgcolor: P.surface,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 900, color: P.text }}>
            Edit video details
          </DialogTitle>

          <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
              fullWidth
              sx={{
                mt: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: P.bg,
                },
              }}
            />

            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              fullWidth
              multiline
              minRows={3}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: P.bg,
                },
              }}
            />

            <TextField
              label="Category"
              value={editForm.category}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, category: e.target.value }))
              }
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: P.bg,
                },
              }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setEditOpen(false)}
              sx={{
                color: P.subtext,
                fontWeight: 800,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={saveVideoEdit}
              variant="contained"
              disabled={!editForm.title.trim()}
              sx={{
                borderRadius: 999,
                px: 3,
                bgcolor: P.accent,
                fontWeight: 900,
                textTransform: "none",
                "&:hover": { bgcolor: P.accent },
              }}
            >
              Save changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}