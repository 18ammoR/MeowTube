import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import PollIcon from "@mui/icons-material/Poll";
import QuizIcon from "@mui/icons-material/Quiz";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import api, { getToken } from "../api";
import meowtubeIcon from "../assets/MeowLogo.png";

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
  return `${d}d ago`;
}

export default function CreatePost() {
  const nav = useNavigate();
  const token = getToken();
  const user = token ? decodeJwtPayload(token) : null;

  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }

    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPosts() {
    try {
      setErr("");
      const res = await api.get(`/posts/user/${user.id}`);
      setPosts(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load posts");
    }
  }

  async function submitPost() {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setErr("");

      const res = await api.post("/posts", {
        text: trimmed,
        visibility,
      });

      setPosts((prev) => [res.data, ...prev]);
      setText("");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to create post");
    }
  }

  async function deletePost(id) {
    const ok = confirm("Delete this post?");
    if (!ok) return;

    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to delete post");
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: P.bg,
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            sx={{
              mb: 2,
              borderRadius: 999,
              borderColor: P.border,
              color: P.text,
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            ← Back to Home
          </Button>
        </Link>

        {/* Profile header */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 5,
            border: `1px solid ${P.border}`,
            bgcolor: P.surface,
            boxShadow: "0 12px 30px rgba(255, 127, 176, 0.12)",
            mb: 2,
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
                {user?.username || "Your Channel"}
              </Typography>

              <Typography sx={{ color: P.subtext }}>
                @{user?.username || "meowtube"}
              </Typography>

              <Typography sx={{ color: P.subtext, mt: 0.5 }}>
                Create posts for your community ✨
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Composer */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            border: `1px solid ${P.border}`,
            bgcolor: P.surface,
            boxShadow: "0 12px 30px rgba(255, 127, 176, 0.10)",
            mb: 3,
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
              {(user?.username || "U")[0].toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography sx={{ fontWeight: 900, color: P.text }}>
                  {user?.username}
                </Typography>

                <Box sx={{ flex: 1 }} />

                <Typography sx={{ color: P.subtext, fontSize: 13, mr: 1 }}>
                  Visibility:
                </Typography>

                <Chip
                  label={visibility}
                  onClick={() =>
                    setVisibility((v) => (v === "Public" ? "Private" : "Public"))
                  }
                  sx={{
                    bgcolor: P.surface2,
                    border: `1px solid ${P.border}`,
                    color: P.text,
                    fontWeight: 800,
                  }}
                />
              </Box>

              <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share something with your community..."
                fullWidth
                multiline
                minRows={4}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: P.bg,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: P.border,
                  },
                }}
              />

              <Divider sx={{ my: 1.5, borderColor: P.border }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  startIcon={<ImageIcon />}
                  sx={{ color: P.text, textTransform: "none", fontWeight: 800 }}
                >
                  Image
                </Button>

                <Button
                  startIcon={<PollIcon />}
                  sx={{ color: P.text, textTransform: "none", fontWeight: 800 }}
                >
                  Image poll
                </Button>

                <Button
                  startIcon={<PollIcon />}
                  sx={{ color: P.text, textTransform: "none", fontWeight: 800 }}
                >
                  Text poll
                </Button>

                <Button
                  startIcon={<QuizIcon />}
                  sx={{ color: P.text, textTransform: "none", fontWeight: 800 }}
                >
                  Quiz
                </Button>

                <Button
                  startIcon={<VideoCallIcon />}
                  sx={{ color: P.text, textTransform: "none", fontWeight: 800 }}
                >
                  Video
                </Button>

                <Box sx={{ flex: 1 }} />

                <Button
                  onClick={() => setText("")}
                  sx={{
                    color: P.subtext,
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={submitPost}
                  disabled={!text.trim()}
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    bgcolor: P.accent,
                    color: "white",
                    fontWeight: 900,
                    textTransform: "none",
                    "&:hover": { bgcolor: P.accent },
                  }}
                >
                  Post
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {err && (
          <Typography sx={{ color: "crimson", mb: 2 }}>
            {err}
          </Typography>
        )}

        {/* Tabs */}
        <Box sx={{ display: "flex", gap: 3, borderBottom: `1px solid ${P.border}`, mb: 2 }}>
          <Typography
            sx={{
              fontWeight: 900,
              color: P.text,
              pb: 1,
              borderBottom: `3px solid ${P.accent}`,
            }}
          >
            PUBLISHED
          </Typography>
          <Typography sx={{ fontWeight: 900, color: P.subtext }}>
            SCHEDULED
          </Typography>
          <Typography sx={{ fontWeight: 900, color: P.subtext }}>
            ARCHIVED
          </Typography>
        </Box>

        {/* Published posts */}
        {posts.length === 0 ? (
          <Paper
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: 4,
              border: `1px solid ${P.border}`,
              bgcolor: P.surface,
            }}
          >
            <Box
              component="img"
              src={meowtubeIcon}
              alt="MeowTube"
              sx={{ width: 64, height: 64, objectFit: "contain", opacity: 0.8 }}
            />

            <Typography sx={{ fontWeight: 900, color: P.text, mt: 1 }}>
              Publish post
            </Typography>

            <Typography sx={{ color: P.subtext, mt: 0.5 }}>
              Posts appear here after you publish and will be visible to your community.
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
                    {(post.username || "U")[0].toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ fontWeight: 900, color: P.text }}>
                        {post.username}
                      </Typography>

                      <Typography sx={{ color: P.subtext, fontSize: 13, ml: 1 }}>
                        {timeAgo(post.createdAt)} • {post.visibility}
                      </Typography>

                      <Box sx={{ flex: 1 }} />

                      <IconButton onClick={() => deletePost(post._id)}>
                        <DeleteOutlineIcon sx={{ color: P.subtext }} />
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
      </Box>
    </Box>
  );
}