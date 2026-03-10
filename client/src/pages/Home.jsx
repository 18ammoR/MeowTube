import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputBase,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Divider,
  useMediaQuery,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

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

function VideoCard({ video }) {
  const navigate = useNavigate();
  return (
    <Card
      onClick={() => navigate(`/watch/${video._id}`)}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        border: `1px solid ${P.border}`,
        boxShadow: "0 10px 25px rgba(255, 127, 176, 0.10)",
        bgcolor: P.surface,
        overflow: "hidden",
        transition: "transform 140ms ease, box-shadow 140ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 30px rgba(255, 127, 176, 0.16)",
        },
      }}
    >
      <CardMedia
        component="img"
        image={video.thumbnail || "https://via.placeholder.com/480x270?text=No+Thumbnail"}
        alt={video.title}
        sx={{  width: "100%",
        aspectRatio: "16 / 9",
        objectFit: "cover",     
        backgroundColor: "#fff0f7",}}
      />
      <Box sx={{ display: "flex", gap: 1.5, p: 1.6 }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: P.surface2,
            color: P.text,
            border: `1px solid ${P.border}`,
          }}
        >
          {(video.uploaderName || "U")[0]?.toUpperCase?.() || "U"}
        </Avatar>

        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
              color: P.text,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.title}
          </Typography>

          <Typography variant="body2" sx={{ color: P.subtext, mt: 0.4 }}>
            {video.uploaderName || "Unknown"}
          </Typography>

          <Typography variant="body2" sx={{ color: P.subtext }}>
            {video.views ?? 0} views • {timeAgo(video.createdAt)}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}

export default function Home() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [videos, setVideos] = useState([]);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => ["All", "Gaming", "Music", "Genshin Impact", "HTML", "News", "Podcasts", "Pop Rock"],
    []
  );

  const sidebarItems = useMemo(
    () => [
      { label: "Home", icon: <HomeIcon />, action: () => setCategory("") },
      { label: "Trending", icon: <WhatshotIcon />, action: () => {} },
      { label: "Subscriptions", icon: <SubscriptionsIcon />, action: () => {} },
      { label: "Library", icon: <VideoLibraryIcon />, action: () => {} },
    ],
    []
  );

  async function loadVideos(nextSearch = search, nextCategory = category) {
    try {
      setErr("");
      const params = new URLSearchParams();
      if (nextSearch) params.set("search", nextSearch);
      if (nextCategory && nextCategory !== "All") params.set("category", nextCategory);

      const res = await axios.get(`/api/videos${params.toString() ? `?${params}` : ""}`);
      setVideos(res.data);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Failed to load videos");
    }
  }

  useEffect(() => {
    loadVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadVideos(search, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  function onSearchSubmit(e) {
    e.preventDefault();
    setSearch(q.trim());
  }

  const drawer = (
  <Box sx={{ width: 270, bgcolor: P.surface, height: "100%", color: P.text }}>
    {/* Top brand area */}
    <Box sx={{ px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            color: P.accent,
            background: P.surface2,
            px: 2,
            py: 0.8,
            borderRadius: 999,
            border: `1px solid ${P.border}`,
            boxShadow: "0 6px 16px rgba(255,127,176,0.15)",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.6,
            width: "fit-content",
          }}
        >
          🐱 MeowTube
        </Typography>
      </Link>

      <Link to="/upload" style={{ textDecoration: "none" }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: "#fff",
            background: `linear-gradient(135deg, ${P.accent}, ${P.accent2})`,
            px: 2,
            py: 0.8,
            borderRadius: 999,
            boxShadow: "0 6px 16px rgba(255,127,176,0.25)",
            width: "fit-content",
          }}
        >
          Upload ✨
        </Typography>
      </Link>
    </Box>

    <Divider sx={{ borderColor: P.border }} />

    {/* Menu items */}
    <List>
      {sidebarItems.map((it) => (
        <ListItemButton
          key={it.label}
          onClick={() => {
            it.action?.();
            setDrawerOpen(false);
          }}
          sx={{
            mx: 1,
            my: 0.4,
            borderRadius: 3,
            "&:hover": { bgcolor: P.surface2 },
          }}
        >
          <ListItemIcon sx={{ color: P.accent }}>{it.icon}</ListItemIcon>
          <ListItemText primary={it.label} />
        </ListItemButton>
      ))}
    </List>
  </Box>
);

  return (
    <Box sx={{ bgcolor: P.bg, minHeight: "100vh" }}>
      {/* Top Bar */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.86)",
          color: P.text,
          boxShadow: "none",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${P.border}`,
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          {/* Left */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: P.text }}>
              <MenuIcon />
            </IconButton>

            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                MeowTube
              </Typography>
            </Link>
          </Box>

          {/* Center search (centered!) */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Box component="form" onSubmit={onSearchSubmit} sx={{ width: "100%", maxWidth: 620 }}>
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
                  placeholder="Search something cute…"
                  sx={{ ml: 1, flex: 1, color: P.text }}
                />
                <IconButton type="submit" sx={{ color: P.accent }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Box>
          </Box>

          {/* Right spacer (keeps search visually centered) */}
          <Box sx={{ width: { xs: 0, sm: 180 } }} />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="temporary"
        PaperProps={{ sx: { bgcolor: P.surface, borderRight: `1px solid ${P.border}` } }}
      >
        {drawer}
      </Drawer>

      {/* Content */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        {err && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              border: `1px solid ${P.border}`,
              borderRadius: 3,
              bgcolor: P.surface,
              color: "#C0406D",
            }}
          >
            {err}
          </Box>
        )}

        {/* ✅ Categories row ABOVE videos (YouTube-like) */}
        <Box
          sx={{
            position: "sticky",
            top: { xs: 56, sm: 64 }, // sticks under AppBar
            zIndex: 2,
            bgcolor: P.bg,
            py: 1.2,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": { background: P.border, borderRadius: 999 },
            }}
          >
            {categories.map((c) => {
              const selected = (category || "All") === c;
              return (
                <Chip
                  key={c}
                  label={c}
                  clickable
                  onClick={() => setCategory(c === "All" ? "" : c)}
                  sx={{
                    borderRadius: 999,
                    border: `1px solid ${P.border}`,
                    bgcolor: selected ? P.accent2 : P.surface,
                    color: P.text,
                    fontWeight: selected ? 800 : 600,
                    "&:hover": { bgcolor: P.surface2 },
                  }}
                />
              );
            })}
          </Box>

          {/* optional: show active search tag */}
          {search && (
            <Typography variant="body2" sx={{ color: P.subtext, mt: 1 }}>
              Results for: <b>{search}</b>{" "}
              <button
                onClick={() => {
                  setSearch("");
                  setQ("");
                }}
                style={{ marginLeft: 8, cursor: "pointer" }}
              >
                clear
              </button>
            </Typography>
          )}
        </Box>

        {/* Videos grid */}
        <Grid container spacing={2}>
          {videos.map((v) => (
            <Grid item key={v._id} xs={12} sm={6} md={4} lg={3}>
              <VideoCard video={v} />
            </Grid>
          ))}
        </Grid>

        {videos.length === 0 && !err && (
          <Typography sx={{ color: P.subtext, mt: 2 }}>
            No videos yet. Upload one and make it cute ✨
          </Typography>
        )}
      </Box>
    </Box>
  );
}