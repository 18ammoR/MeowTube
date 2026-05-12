import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Paper,
  InputBase,
  Button,
  Avatar,
  Card,
  CardMedia,
  Chip,
  Divider,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import HomeIcon from "@mui/icons-material/Home";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PauseIcon from "@mui/icons-material/Pause";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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

const TOP_BAR_HEIGHT = 70;
const SIDEBAR_WIDTH = 80;

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
  return `${Math.floor(mo / 12)}y ago`;
}

export default function History() {
  const navigate = useNavigate();

  const token = getToken();
  const user = token ? decodeJwtPayload(token) : null;

  const [q, setQ] = useState("");
  const [history, setHistory] = useState([]);
  const [searchHistory, setSearchHistory] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredHistory = useMemo(() => {
    const s = searchHistory.trim().toLowerCase();
    if (!s) return history;

    return history.filter((item) => {
      const video = item.video || {};
      return (
        String(video.title || "").toLowerCase().includes(s) ||
        String(video.uploaderName || "").toLowerCase().includes(s) ||
        String(video.category || "").toLowerCase().includes(s)
      );
    });
  }, [history, searchHistory]);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHistory() {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setErr("");
      setLoading(true);

      const res = await api.get("/history");
      setHistory(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    const ok = confirm("Clear all watch history?");
    if (!ok) return;

    try {
      await api.delete("/history");
      setHistory([]);
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to clear history");
    }
  }

  async function removeHistoryItem(videoId) {
    try {
      await api.delete(`/history/${videoId}`);
      setHistory((prev) => prev.filter((h) => h.videoId !== videoId));
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to remove item");
    }
  }

  function onSearchSubmit(e) {
    e.preventDefault();

    if (q.trim()) {
      navigate(`/?search=${encodeURIComponent(q.trim())}`);
    } else {
      navigate("/");
    }
  }

  return (
    <Box sx={{ bgcolor: P.bg, minHeight: "100vh", overflowX: "hidden" }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          bgcolor: "rgba(255, 255, 255, 0.88)",
          color: P.text,
          boxShadow: "none",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${P.border}`,
        }}
      >
        <Toolbar
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "auto 1fr auto",
              md: "260px 1fr 260px",
            },
            alignItems: "center",
            gap: 2,
            minHeight: `${TOP_BAR_HEIGHT}px`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => navigate("/")} sx={{ color: P.text }}>
              <MenuIcon />
            </IconButton>

            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  component="img"
                  src={meowtubeIcon}
                  alt="MeowTube"
                  sx={{ width: 38, height: 38, objectFit: "contain" }}
                />

                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  MeowTube
                </Typography>
              </Box>
            </Link>
          </Box>

          <Box
            sx={{
              justifySelf: "center",
              width: "100%",
              maxWidth: 760,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box component="form" onSubmit={onSearchSubmit} sx={{ flex: 1 }}>
              <Paper
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1.2,
                  py: 0.3,
                  borderRadius: 999,
                  bgcolor: P.surface,
                  border: `1px solid ${P.border}`,
                  boxShadow: "0 10px 25px rgba(255, 127, 176, 0.10)",
                }}
              >
                <InputBase
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search"
                  sx={{ ml: 1, flex: 1, color: P.text }}
                />

                <IconButton type="submit" sx={{ color: P.accent }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Box>

            <IconButton
              sx={{
                width: 48,
                height: 48,
                bgcolor: P.surface2,
                border: `1px solid ${P.border}`,
                color: P.accent,
                "&:hover": { bgcolor: P.accent2 },
              }}
            >
              <MicIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}>
            <Button
              onClick={() => navigate("/upload")}
              sx={{
                borderRadius: 999,
                px: 2,
                fontWeight: 900,
                bgcolor: P.surface2,
                color: P.text,
                border: `1px solid ${P.border}`,
                textTransform: "none",
                "&:hover": { bgcolor: P.accent2 },
              }}
            >
              + Create
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Left Sidebar */}
      <Box
        sx={{
          position: "fixed",
          top: `${TOP_BAR_HEIGHT}px`,
          left: 0,
          width: `${SIDEBAR_WIDTH}px`,
          height: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
          bgcolor: P.surface2,
          borderRight: `1px solid ${P.border}`,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          py: 2,
          gap: 2,
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Box sx={{ textAlign: "center", color: P.text }}>
            <HomeIcon sx={{ color: P.accent }} />
            <Typography sx={{ fontSize: 11 }}>Home</Typography>
          </Box>
        </Link>

        <Box sx={{ textAlign: "center", color: P.text }}>
          <SlowMotionVideoIcon sx={{ color: P.accent }} />
          <Typography sx={{ fontSize: 11 }}>Shorts</Typography>
        </Box>

        <Box
          onClick={() => navigate("/subscriptions")}
          sx={{ textAlign: "center", color: P.text, cursor: "pointer" }}
        >
          <SubscriptionsIcon sx={{ color: P.accent }} />
          <Typography sx={{ fontSize: 11 }}>Subscriptions</Typography>
        </Box>

        <Box
          onClick={() => navigate(user ? "/profile" : "/login")}
          sx={{ textAlign: "center", color: P.text, cursor: "pointer" }}
        >
          <AccountCircleIcon sx={{ color: P.accent }} />
          <Typography sx={{ fontSize: 11 }}>You</Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          pt: `${TOP_BAR_HEIGHT + 32}px`,
          px: { xs: 2, md: 5 },
          pb: 5,
        }}
      >
        <Box
          sx={{
            maxWidth: 1500,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1fr) 340px",
            },
            gap: 5,
          }}
        >
          {/* Left history list */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: P.text }}>
              Watch history
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mt: 2, mb: 3 }}>
              {["All", "Videos", "Shorts", "Podcasts", "Music"].map((c) => (
                <Chip
                  key={c}
                  label={c}
                  sx={{
                    bgcolor: c === "All" ? P.accent2 : P.surface,
                    color: P.text,
                    border: `1px solid ${P.border}`,
                    fontWeight: 800,
                  }}
                />
              ))}
            </Box>

            {!token ? (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `1px solid ${P.border}`,
                  bgcolor: P.surface,
                }}
              >
                <Typography sx={{ color: P.text, fontWeight: 900 }}>
                  Please login to view your watch history.
                </Typography>

                <Button
                  onClick={() => navigate("/login")}
                  sx={{
                    mt: 2,
                    borderRadius: 999,
                    bgcolor: P.accent,
                    color: "white",
                    fontWeight: 900,
                    "&:hover": { bgcolor: P.accent },
                  }}
                >
                  Login
                </Button>
              </Paper>
            ) : loading ? (
              <Typography sx={{ color: P.subtext }}>Loading history…</Typography>
            ) : err ? (
              <Typography sx={{ color: "crimson" }}>{err}</Typography>
            ) : filteredHistory.length === 0 ? (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `1px solid ${P.border}`,
                  bgcolor: P.surface,
                }}
              >
                <Typography sx={{ color: P.text, fontWeight: 900 }}>
                  No watch history yet.
                </Typography>

                <Typography sx={{ color: P.subtext, mt: 0.7 }}>
                  Videos you watch will appear here.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "grid", gap: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: P.text }}
                >
                  Today
                </Typography>

                {filteredHistory.map((item) => {
                  const video = item.video;

                  return (
                    <Box
                      key={item._id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "280px 1fr auto",
                        },
                        gap: 2,
                        alignItems: "start",
                      }}
                    >
                      <Card
                        onClick={() => navigate(`/watch/${video._id}`)}
                        sx={{
                          cursor: "pointer",
                          borderRadius: 3,
                          overflow: "hidden",
                          border: `1px solid ${P.border}`,
                          boxShadow: "0 10px 25px rgba(255, 127, 176, 0.10)",
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={
                            video.thumbnail ||
                            "https://via.placeholder.com/480x270?text=Video"
                          }
                          alt={video.title}
                          sx={{
                            aspectRatio: "16 / 9",
                            objectFit: "cover",
                            bgcolor: P.surface2,
                          }}
                        />
                      </Card>

                      <Box>
                        <Typography
                          onClick={() => navigate(`/watch/${video._id}`)}
                          sx={{
                            cursor: "pointer",
                            fontWeight: 900,
                            color: P.text,
                            fontSize: 18,
                            lineHeight: 1.25,
                          }}
                        >
                          {video.title}
                        </Typography>

                        <Typography sx={{ color: P.subtext, mt: 0.7 }}>
                          {video.uploaderName || "Unknown"} •{" "}
                          {video.views ?? 0} views
                        </Typography>

                        <Typography sx={{ color: P.subtext, mt: 0.7 }}>
                          Watched {timeAgo(item.watchedAt)}
                        </Typography>
                      </Box>

                      <IconButton
                        onClick={() => removeHistoryItem(video._id)}
                        sx={{
                          color: P.subtext,
                          "&:hover": { bgcolor: P.surface2 },
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Right history controls */}
          <Box>
            <Paper
              sx={{
                p: 2,
                borderRadius: 4,
                border: `1px solid ${P.border}`,
                bgcolor: P.surface,
                position: "sticky",
                top: `${TOP_BAR_HEIGHT + 24}px`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: `1px solid ${P.border}`,
                  pb: 1,
                  mb: 2,
                }}
              >
                <SearchIcon sx={{ color: P.subtext, mr: 1 }} />
                <InputBase
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="Search watch history"
                  sx={{ flex: 1, color: P.text }}
                />
              </Box>

              <Button
                onClick={clearHistory}
                startIcon={<DeleteOutlineIcon />}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  color: P.text,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: 3,
                  py: 1,
                  "&:hover": { bgcolor: P.surface2 },
                }}
              >
                Clear all watch history
              </Button>

              <Button
                startIcon={<PauseIcon />}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  color: P.text,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: 3,
                  py: 1,
                  "&:hover": { bgcolor: P.surface2 },
                }}
              >
                Pause watch history
              </Button>

              <Button
                startIcon={<SettingsIcon />}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  color: P.text,
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: 3,
                  py: 1,
                  "&:hover": { bgcolor: P.surface2 },
                }}
              >
                Manage all history
              </Button>

              <Divider sx={{ my: 2, borderColor: P.border }} />

              <Typography sx={{ color: P.subtext, fontWeight: 800, mb: 1 }}>
                Comments
              </Typography>

              <Typography sx={{ color: P.subtext, fontWeight: 800, mb: 1 }}>
                Posts
              </Typography>

              <Typography sx={{ color: P.subtext, fontWeight: 800 }}>
                Live chat
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}