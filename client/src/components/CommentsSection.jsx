import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

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

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export default function CommentsSection({ videoId }) {
  // ✅ read latest auth every render (works after login/logout)
  const token = localStorage.getItem("token");
  const user = token ? decodeJwtPayload(token) : null;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  // ✅ move these hooks INSIDE component
  const [editingId, setEditingId] = useState("");
  const [editText, setEditText] = useState("");

  async function fetchComments() {
    setErr("");
    setLoading(true);
    try {
      const res = await axios.get(`/api/videos/${videoId}/comments`);
      setComments(res.data);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  async function postComment() {
    if (!token) {
      alert("Please login first to comment.");
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;

    setPosting(true);
    setErr("");
    try {
      const res = await axios.post(
        `/api/videos/${videoId}/comments`,
        { text: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [res.data, ...prev]);
      setText("");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  async function likeComment(commentId) {
    if (!token) {
      alert("Please login first to like comments.");
      return;
    }
    try {
      const res = await axios.post(
        `/api/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, likeCount: res.data.likeCount } : c
        )
      );
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to like comment");
    }
  }

  async function deleteComment(commentId) {
    if (!token) return;
    const ok = confirm("Delete this comment?");
    if (!ok) return;

    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to delete comment");
    }
  }

  async function saveEdit(commentId) {
    if (!token) return;
    const trimmed = editText.trim();
    if (!trimmed) return;

    try {
      const res = await axios.put(
        `/api/comments/${commentId}`,
        { text: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, ...res.data } : c))
      );
      setEditingId("");
      setEditText("");
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to edit comment");
    }
  }

  return (
    <Paper
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        border: `1px solid ${P.border}`,
        bgcolor: P.surface,
        boxShadow: "0 10px 25px rgba(255, 127, 176, 0.10)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: P.text }}>
          Comments
        </Typography>
        <Chip
          label={comments.length}
          size="small"
          sx={{ bgcolor: P.surface2, border: `1px solid ${P.border}`, color: P.text }}
        />
        {!token && (
          <Typography variant="body2" sx={{ color: P.subtext, ml: 1 }}>
            (Login to comment/like)
          </Typography>
        )}
      </Box>

      {/* Add comment */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: P.surface2,
            color: P.text,
            border: `1px solid ${P.border}`,
          }}
        >
          {(user?.username || "U")[0]?.toUpperCase?.() || "U"}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            fullWidth
            multiline
            minRows={2}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: P.bg },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: P.border },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, gap: 1 }}>
            <Button
              onClick={() => setText("")}
              variant="outlined"
              sx={{ borderColor: P.border, color: P.subtext, borderRadius: 999 }}
            >
              Cancel
            </Button>
            <Button
              onClick={postComment}
              disabled={posting || !text.trim()}
              variant="contained"
              sx={{
                bgcolor: P.accent,
                borderRadius: 999,
                fontWeight: 800,
                "&:hover": { bgcolor: P.accent },
              }}
            >
              {posting ? "Posting…" : "Comment"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: P.border, mb: 2 }} />

      {err && (
        <Box sx={{ mb: 2, p: 1.5, border: `1px solid ${P.border}`, borderRadius: 3, color: "#C0406D", bgcolor: P.surface2 }}>
          {err}
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", color: P.subtext }}>
          <CircularProgress size={18} />
          Loading comments…
        </Box>
      ) : comments.length === 0 ? (
        <Typography sx={{ color: P.subtext }}>Be the first to comment ✨</Typography>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {comments.map((c) => {
            const isOwner = token && user?.id && c.userId === user.id;

            return (
              <Box key={c._id} sx={{ display: "flex", gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: P.surface2,
                    color: P.text,
                    border: `1px solid ${P.border}`,
                  }}
                >
                  {(c.username || "U")[0]?.toUpperCase?.() || "U"}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: P.text }}>
                      {c.username || "Unknown"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: P.subtext }}>
                      {timeAgo(c.createdAt)}
                    </Typography>
                    {c.editedAt && (
                      <Typography variant="body2" sx={{ color: P.subtext }}>
                        (edited)
                      </Typography>
                    )}
                  </Box>

                  {editingId === c._id ? (
                    <Box sx={{ mt: 0.5 }}>
                      <TextField
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: P.bg },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: P.border },
                        }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                        <Button
                          onClick={() => {
                            setEditingId("");
                            setEditText("");
                          }}
                          variant="outlined"
                          sx={{ borderColor: P.border, color: P.subtext, borderRadius: 999 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => saveEdit(c._id)}
                          disabled={!editText.trim()}
                          variant="contained"
                          sx={{ bgcolor: P.accent, borderRadius: 999, fontWeight: 800, "&:hover": { bgcolor: P.accent } }}
                        >
                          Save
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography sx={{ color: P.text, whiteSpace: "pre-wrap" }}>
                      {c.text}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <IconButton onClick={() => likeComment(c._id)} size="small" sx={{ color: P.accent }} title="Like">
                      {(c.likeCount ?? (c.likes?.length || 0)) > 0 ? (
                        <FavoriteIcon fontSize="small" />
                      ) : (
                        <FavoriteBorderIcon fontSize="small" />
                      )}
                    </IconButton>

                    <Typography variant="body2" sx={{ color: P.subtext, mr: 1 }}>
                      {c.likeCount ?? (c.likes?.length || 0)}
                    </Typography>

                    {isOwner && editingId !== c._id && (
                      <IconButton
                        onClick={() => {
                          setEditingId(c._id);
                          setEditText(c.text || "");
                        }}
                        size="small"
                        sx={{ color: P.subtext }}
                        title="Edit"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}

                    {isOwner && (
                      <IconButton onClick={() => deleteComment(c._id)} size="small" sx={{ color: P.subtext }} title="Delete">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}