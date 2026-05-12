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
  CardContent,
  Chip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import HomeIcon from "@mui/icons-material/Home";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

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
    if (!base64Url) return null;

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

function SubVideoCard({ video }) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/watch/${video._id}`)}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        border: `1px solid ${P.border}`,
        overflow: "hidden",
        bgcolor: P.surface,
        boxShadow: "0 10px 25px rgba(255, 127, 176, 0.10)",
        height: "100%",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 30px rgba(255, 127, 176, 0.16)",
        },
      }}
    >
      <CardMedia
        component="img"
        image={
          video.thumbnail ||
          "https://via.placeholder.com/480x270?text=No+Thumbnail"
        }
        alt={video.title}
        sx={{
          width: "100%",
          aspectRatio: "16 / 9",
          objectFit: "cover",
          bgcolor: P.surface2,
        }}
      />

      <Box sx={{ display: "flex", gap: 1.5, p: 1.5 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: P.surface2,
            color: P.text,
            border: `1px solid ${P.border}`,
            fontWeight: 900,
          }}
        >
          {(video.uploaderName || "U")[0]?.toUpperCase?.() || "U"}
        </Avatar>

        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Typography
            sx={{
              fontWeight: 900,
              color: P.text,
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.title}
          </Typography>

          <Typography sx={{ color: P.subtext, fontSize: 14, mt: 0.5 }}>
            {video.uploaderName || "Unknown"}
          </Typography>

          <Typography sx={{ color: P.subtext, fontSize: 14 }}>
            {video.views ?? 0} views • {timeAgo(video.createdAt)}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}

export default function Subscriptions() {
  const navigate = useNavigate();

  const token = getToken();
  const user = token ? decodeJwtPayload(token) : null;

  const [q, setQ] = useState("");
  const [videos, setVideos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const subscribedUserIds = useMemo(() => {
    return profile?.subscriptions || [];
  }, [profile]);

  const subscribedVideos = useMemo(() => {
    return videos
      .filter((v) => subscribedUserIds.includes(v.userId))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [videos, subscribedUserIds]);

  const latestVideos = subscribedVideos.slice(0, 3);
  const mostRelevantVideos = subscribedVideos.slice(3);

  useEffect(() => {
    async function load() {
      if (!token || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setErr("");
        setLoading(true);

        const [profileRes, videosRes] = await Promise.all([
          api.get(`/users/${user.id}`),
          api.get("/videos"),
        ]);

        setProfile(profileRes.data);
        setVideos(videosRes.data || []);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, user?.id]);

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

      {/* Left sidebar */}
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

        <Box sx={{ textAlign: "center", color: P.text }}>
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

      {/* Main content */}
      <Box
        sx={{
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          pt: `${TOP_BAR_HEIGHT + 28}px`,
          px: { xs: 2, md: 4 },
          pb: 4,
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: "auto" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, color: P.text }}>
              Latest
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Button
              sx={{
                borderRadius: 999,
                bgcolor: P.surface2,
                color: P.text,
                border: `1px solid ${P.border}`,
                fontWeight: 900,
                textTransform: "none",
                "&:hover": { bgcolor: P.accent2 },
              }}
            >
              All subscriptions
            </Button>
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
                Please login to view videos from your subscriptions.
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
            <Typography sx={{ color: P.subtext }}>Loading subscriptions…</Typography>
          ) : err ? (
            <Typography sx={{ color: "crimson" }}>{err}</Typography>
          ) : subscribedVideos.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                border: `1px solid ${P.border}`,
                bgcolor: P.surface,
              }}
            >
              <Typography sx={{ color: P.text, fontWeight: 900 }}>
                No subscription videos yet.
              </Typography>

              <Typography sx={{ color: P.subtext, mt: 0.7 }}>
                Subscribe to channels from the Watch page, then their latest uploads will appear here.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Latest row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 2,
                  mb: 5,
                }}
              >
                {latestVideos.map((video) => (
                  <SubVideoCard key={video._id} video={video} />
                ))}
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 900, color: P.text, mb: 2 }}
              >
                Most relevant
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {mostRelevantVideos.map((video) => (
                  <SubVideoCard key={video._id} video={video} />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}