import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import meowtubeIcon from "../assets/MeowLogo.png";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Button,
  Badge,
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
  Menu,
  MenuItem,
  Popover,

} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import HomeIcon from "@mui/icons-material/Home";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import ShareIcon from "@mui/icons-material/Share";
import BlockIcon from "@mui/icons-material/Block";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import EditNoteIcon from "@mui/icons-material/EditNote";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";


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

const TOP_BAR_HEIGHT = 64;
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
function VideoCard({ video, onDeleted }) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const token = localStorage.getItem("token");
  const user = token ? decodeJwtPayload(token) : null;
  const isOwner = user?.id && video.userId === user.id;

  function openMenu(e) {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }

  function closeMenu(e) {
    e?.stopPropagation?.();
    setAnchorEl(null);
  }

  function goWatch(e) {
    e.stopPropagation();
    closeMenu(e);
    navigate(`/watch/${video._id}`);
  }

  async function copyLink(e) {
    e.stopPropagation();
    closeMenu(e);

    const link = `${window.location.origin}/watch/${video._id}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Video link copied!");
    } catch {
      alert(link);
    }
  }

  function watchLater(e) {
    e.stopPropagation();
    closeMenu(e);
    alert("Watch Later feature can be added later.");
  }

  function notInterested(e) {
    e.stopPropagation();
    closeMenu(e);
    alert("Not interested feature can be added later.");
  }

  async function deleteVideo(e) {
    e.stopPropagation();
    closeMenu(e);

    const ok = confirm("Delete this video? This cannot be undone.");
    if (!ok) return;

    try {
      await axios.delete(`/api/videos/${video._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Video deleted!");
      onDeleted?.(video._id);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Failed to delete video");
    }
  }

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
        height: "100%",
        transition: "transform 140ms ease, box-shadow 140ms ease",
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
          backgroundColor: "#fff0f7",
        }}
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

        <CardContent sx={{ p: 0, flex: 1, "&:last-child": { pb: 0 } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                flex: 1,
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

            <IconButton
              onClick={openMenu}
              size="small"
              sx={{
                color: P.subtext,
                mt: -0.5,
                "&:hover": {
                  bgcolor: P.surface2,
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ color: P.subtext, mt: 0.4 }}>
            {video.uploaderName || "Unknown"}
          </Typography>

          <Typography variant="body2" sx={{ color: P.subtext }}>
            {video.views ?? 0} views • {timeAgo(video.createdAt)}
          </Typography>
        </CardContent>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 230,
            bgcolor: P.surface,
            border: `1px solid ${P.border}`,
            boxShadow: "0 14px 35px rgba(255, 127, 176, 0.20)",
            color: P.text,
          },
        }}
      >
        <MenuItem onClick={goWatch}>
          <ListItemIcon>
            <PlayCircleOutlineIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Watch" />
        </MenuItem>

        <MenuItem onClick={watchLater}>
          <ListItemIcon>
            <WatchLaterIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Save to Watch Later" />
        </MenuItem>

        <MenuItem onClick={copyLink}>
          <ListItemIcon>
            <ShareIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Share / Copy link" />
        </MenuItem>

        <MenuItem onClick={notInterested}>
          <ListItemIcon>
            <BlockIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Not interested" />
        </MenuItem>

        <MenuItem onClick={watchLater}>
          <ListItemIcon>
            <PlaylistAddIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Save to playlist" />
        </MenuItem>

        {isOwner && (
          <MenuItem onClick={deleteVideo} sx={{ color: "#C0406D" }}>
            <ListItemIcon>
              <DeleteOutlineIcon sx={{ color: "#C0406D" }} />
            </ListItemIcon>
            <ListItemText primary="Delete video" />
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}

function ShortsSection({ shorts, onDeleted }) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedShort, setSelectedShort] = useState(null);

  const menuOpen = Boolean(anchorEl);

  const token = localStorage.getItem("token");
  const user = token ? decodeJwtPayload(token) : null;
  const isOwner = user?.id && selectedShort?.userId === user.id;

  if (!shorts.length) return null;

  function openMenu(e, video) {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedShort(video);
  }

  function closeMenu(e) {
    e?.stopPropagation?.();
    setAnchorEl(null);
    setSelectedShort(null);
  }

  function goWatch(e) {
    e.stopPropagation();
    if (!selectedShort) return;
    navigate(`/watch/${selectedShort._id}`);
    closeMenu(e);
  }

  async function copyLink(e) {
    e.stopPropagation();
    if (!selectedShort) return;

    const link = `${window.location.origin}/watch/${selectedShort._id}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Short link copied!");
    } catch {
      alert(link);
    }

    closeMenu(e);
  }

  function watchLater(e) {
    e.stopPropagation();
    alert("Watch Later feature can be added later.");
    closeMenu(e);
  }

  function notInterested(e) {
    e.stopPropagation();
    alert("Not interested feature can be added later.");
    closeMenu(e);
  }

  async function deleteShort(e) {
    e.stopPropagation();

    if (!selectedShort) return;

    const ok = confirm("Delete this short? This cannot be undone.");
    if (!ok) return;

    try {
      await axios.delete(`/api/videos/${selectedShort._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Short deleted!");
      onDeleted?.(selectedShort._id);
      closeMenu(e);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Failed to delete short");
    }
  }

  return (
    <Box sx={{ my: 3 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          color: P.text,
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        🎬 Shorts
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: "16px",
        }}
      >
        {shorts.map((video) => (
          <Card
            key={video._id}
            onClick={() => navigate(`/watch/${video._id}`)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${P.border}`,
              bgcolor: P.surface,
              boxShadow: "0 10px 25px rgba(255, 127, 176, 0.10)",
              position: "relative",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 14px 30px rgba(255, 127, 176, 0.16)",
              },
            }}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="img"
                image={
                  video.thumbnail ||
                  "https://via.placeholder.com/270x480?text=Short"
                }
                alt={video.title}
                sx={{
                  width: "100%",
                  aspectRatio: "9 / 16",
                  objectFit: "cover",
                  bgcolor: P.surface2,
                }}
              />

            </Box>

            <CardContent sx={{ p: 1.2 }}>
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}>
    <Typography
      sx={{
        flex: 1,
        fontWeight: 800,
        color: P.text,
        fontSize: 14,
        lineHeight: 1.2,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {video.title}
    </Typography>

    <IconButton
      onClick={(e) => openMenu(e, video)}
      size="small"
      sx={{
        color: P.subtext,
        mt: -0.5,
        "&:hover": {
          bgcolor: P.surface2,
        },
      }}
    >
      <MoreVertIcon fontSize="small" />
    </IconButton>
  </Box>

  <Typography sx={{ color: P.subtext, fontSize: 12, mt: 0.4 }}>
    {video.views ?? 0} views
  </Typography>
</CardContent>
          </Card>
        ))}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 230,
            bgcolor: P.surface,
            border: `1px solid ${P.border}`,
            boxShadow: "0 14px 35px rgba(255, 127, 176, 0.20)",
            color: P.text,
          },
        }}
      >
        <MenuItem onClick={goWatch}>
          <ListItemIcon>
            <PlayCircleOutlineIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Watch" />
        </MenuItem>

        <MenuItem onClick={watchLater}>
          <ListItemIcon>
            <WatchLaterIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Save to Watch Later" />
        </MenuItem>

        <MenuItem onClick={copyLink}>
          <ListItemIcon>
            <ShareIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Share / Copy link" />
        </MenuItem>

        <MenuItem onClick={notInterested}>
          <ListItemIcon>
            <BlockIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Not interested" />
        </MenuItem>

        <MenuItem onClick={watchLater}>
          <ListItemIcon>
            <PlaylistAddIcon sx={{ color: P.accent }} />
          </ListItemIcon>
          <ListItemText primary="Save to playlist" />
        </MenuItem>

        {isOwner && (
          <MenuItem onClick={deleteShort} sx={{ color: "#C0406D" }}>
            <ListItemIcon>
              <DeleteOutlineIcon sx={{ color: "#C0406D" }} />
            </ListItemIcon>
            <ListItemText primary="Delete short" />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export default function Home() {
  const navigate = useNavigate();
const [createAnchor, setCreateAnchor] = useState(null);
const [profileAnchor, setProfileAnchor] = useState(null);
const token = localStorage.getItem("token");
const user = token ? decodeJwtPayload(token) : null;
const [notificationAnchor, setNotificationAnchor] = useState(null);
const notificationOpen = Boolean(notificationAnchor);

function logout() {
  localStorage.removeItem("token");
  navigate("/login");
}
  const isMobile = useMediaQuery("(max-width:900px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [videos, setVideos] = useState([]);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => ["All", "Gaming", "Music", "Genshin Impact", "HTML", "News", "Podcasts","Shorts", "Pop Rock","Minecraft","Cartoons","Animated Films","Memes","Honkai: Star Rail","Emocore","Car","Dance","Indie Games"],
    []
  );

  const sidebarItems = useMemo(
    () => [
      { label: "Home", icon: <HomeIcon />, action: () => setCategory("") },
       { label: "Shorts", icon: <SlowMotionVideoIcon />, action: () => setCategory("Shorts") },
      { label: "Subscriptions", icon: <SubscriptionsIcon />, to: "/subscriptions" },
      { label: "Library", icon: <VideoLibraryIcon />, action: () => {} },
      { label: "History", icon: <HistoryIcon />, to: "/history" },
    { label: "Settings", icon: <SettingsIcon />, to: "/settings" },
    { label: "You", icon: <AccountCircleIcon />, to: user ? "/profile" : "/login" },
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
  function isShortVideo(video) {
  const categoryText = String(video.category || "").toLowerCase();
  const titleText = String(video.title || "").toLowerCase();

  return (
    categoryText.includes("short") ||
    titleText.includes("#shorts") ||
    titleText.includes("shorts")
  );
}

const shortsVideos = videos.filter(isShortVideo);
const normalVideos = videos.filter((v) => !isShortVideo(v));

const VIDEOS_BEFORE_SHORTS = 8;
const topVideos = normalVideos.slice(0, VIDEOS_BEFORE_SHORTS);
const bottomVideos = normalVideos.slice(VIDEOS_BEFORE_SHORTS);

  const drawer = (
  <Box
  sx={{
    width: "100%",
    bgcolor: P.surface2,
    height: "100%",
    color: P.text,
    py: 2,
    overflowY: "auto",
  }}
>
    {/* Menu items */}
    <List>
      {sidebarItems.map((it) => (
        <ListItemButton
          key={it.label}
          onClick={() => {
            if (it.to) {
              navigate(it.to);
            } else {
              it.action?.();
            }

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
          <ListItemText
            primary={it.label}
            primaryTypographyProps={{
              fontWeight: 700,
            }}
          />
        </ListItemButton>
      ))}
    </List>

    <Divider sx={{ my: 1.5, borderColor: P.border }} />

    {/* Sign in panel - only shows if user is NOT logged in */}
    {!user && (
      <>
        <Box sx={{ px: 3, py: 1.5 }}>
          <Typography
            sx={{
              color: P.text,
              fontWeight: 700,
              lineHeight: 1.4,
              mb: 2,
            }}
          >
            Sign in to like videos, comment, and subscribe.
          </Typography>

          <Button
            onClick={() => {
              setDrawerOpen(false);
              navigate("/login");
            }}
            variant="outlined"
            startIcon={<AccountCircleIcon />}
            sx={{
              borderRadius: 999,
              borderColor: P.border,
              color: P.accent,
              fontWeight: 800,
              textTransform: "none",
              px: 2,
              "&:hover": {
                borderColor: P.accent,
                bgcolor: P.surface2,
              },
            }}
          >
            Sign in
          </Button>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: P.border }} />
      </>
    )}
  </Box>
);

  return (
    <Box sx={{ bgcolor: P.bg, minHeight: "100vh", overflowX: "hidden" }}>
      {/* Top Bar */}
     <AppBar
  position="fixed"
  sx={{
    zIndex: 1400,
    bgcolor: "rgba(255, 255, 255, 0.86)",
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
      md: "260px 1fr 300px",
    },
    alignItems: "center",
    gap: 2,
    minHeight: `${TOP_BAR_HEIGHT}px`,
    width: "100%",
  }}
>
    {/* Left: menu + logo */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton
  onClick={() => setDrawerOpen((prev) => !prev)}
  sx={{ color: P.text }}
>
  <MenuIcon />
</IconButton>

      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    <Box
      component="img"
      src={meowtubeIcon}
      alt="MeowTube logo"
      sx={{
        width: 38,
        height: 38,
        objectFit: "contain",
      }}
    />

    <Typography variant="h6" sx={{ fontWeight: 900 }}>
      MeowTube
    </Typography>
  </Box>
</Link>
    </Box>

    {/* Center: search + mic */}
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
      <Box
        component="form"
        onSubmit={onSearchSubmit}
        sx={{ flex: 1, maxWidth: 680 }}
      >
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

    {/* Right: Create, Notifications, Profile */}
    <Box
  sx={{
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    justifySelf: "end",
    gap: 1,
    pr: 5,
  }}
>
      <Button
        onClick={(e) => setCreateAnchor(e.currentTarget)}
        startIcon={<AddIcon />}
        sx={{
          borderRadius: 999,
          px: 2,
          py: 0.8,
          fontWeight: 800,
          color: P.text,
          bgcolor: P.surface2,
          border: `1px solid ${P.border}`,
          textTransform: "none",
          "&:hover": { bgcolor: P.accent2 },
        }}
      >
        Create
      </Button>

      <IconButton
  onClick={(e) => setNotificationAnchor(e.currentTarget)}
  sx={{
    color: P.text,
    bgcolor: P.surface2,
    border: `1px solid ${P.border}`,
    "&:hover": { bgcolor: P.accent2 },
  }}
>
  <Badge badgeContent={3} color="error">
    <NotificationsIcon />
  </Badge>
</IconButton>

      <IconButton
        onClick={(e) => setProfileAnchor(e.currentTarget)}
        sx={{
          color: P.text,
          bgcolor: P.surface2,
          border: `1px solid ${P.border}`,
          "&:hover": { bgcolor: P.accent2 },
        }}
      >
        {user ? (
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: P.accent,
              color: "white",
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            {(user.username || "U")[0].toUpperCase()}
          </Avatar>
        ) : (
          <AccountCircleIcon />
        )}
      </IconButton>
    </Box>
  </Toolbar>
</AppBar>

<Popover
  open={notificationOpen}
  anchorEl={notificationAnchor}
  onClose={() => setNotificationAnchor(null)}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "right",
  }}
  transformOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
  PaperProps={{
    sx: {
      mt: 1,
      width: 430,
      maxHeight: 620,
      borderRadius: 4,
      overflow: "hidden",
      border: `1px solid ${P.border}`,
      boxShadow: "0 16px 40px rgba(255, 127, 176, 0.22)",
      bgcolor: P.surface,
    },
  }}
>
  <Box>
    {/* Header */}
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${P.border}`,
      }}
    >
      <Typography sx={{ fontWeight: 900, color: P.text, fontSize: 18 }}>
        Notifications
      </Typography>

      <Box sx={{ flex: 1 }} />

      <IconButton
        size="small"
        onClick={() => navigate("/settings")}
        sx={{ color: P.subtext }}
      >
        <SettingsIcon fontSize="small" />
      </IconButton>
    </Box>

    {/* Body */}
    <Box
      sx={{
        maxHeight: 550,
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: 8 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: P.border,
          borderRadius: 999,
        },
      }}
    >
      <Typography
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
          fontWeight: 900,
          color: P.text,
        }}
      >
        Important
      </Typography>

      {[
        {
          user: "MeowTube",
          text: "Welcome back! New uploaded videos are waiting for you.",
          time: "Just now",
          avatar: "M",
        },
        {
          user: "System",
          text: "Your video upload feature is working successfully.",
          time: "10 minutes ago",
          avatar: "S",
        },
      ].map((n, index) => (
        <Box
          key={index}
          sx={{
            px: 2,
            py: 1.5,
            display: "grid",
            gridTemplateColumns: "44px 1fr 76px",
            gap: 1.5,
            cursor: "pointer",
            "&:hover": { bgcolor: P.surface2 },
          }}
        >
          <Avatar
            sx={{
              bgcolor: P.accent,
              color: "white",
              fontWeight: 900,
            }}
          >
            {n.avatar}
          </Avatar>

          <Box>
            <Typography sx={{ color: P.text, fontWeight: 800, lineHeight: 1.25 }}>
              {n.user}{" "}
              <Typography component="span" sx={{ color: P.text, fontWeight: 500 }}>
                {n.text}
              </Typography>
            </Typography>

            <Typography sx={{ color: P.subtext, fontSize: 13, mt: 0.4 }}>
              {n.time}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 76,
              height: 44,
              borderRadius: 2,
              bgcolor: P.surface2,
              border: `1px solid ${P.border}`,
              display: "grid",
              placeItems: "center",
              color: P.accent,
              fontWeight: 900,
              fontSize: 12,
            }}
          >
            New
          </Box>
        </Box>
      ))}

      <Divider sx={{ my: 1, borderColor: P.border }} />

      <Typography
        sx={{
          px: 2,
          pt: 1,
          pb: 1,
          fontWeight: 900,
          color: P.text,
        }}
      >
        More notifications
      </Typography>

      {videos.slice(0, 5).map((v) => (
        <Box
          key={v._id}
          onClick={() => {
            setNotificationAnchor(null);
            navigate(`/watch/${v._id}`);
          }}
          sx={{
            px: 2,
            py: 1.5,
            display: "grid",
            gridTemplateColumns: "44px 1fr 86px",
            gap: 1.5,
            cursor: "pointer",
            "&:hover": { bgcolor: P.surface2 },
          }}
        >
          <Avatar
            sx={{
              bgcolor: P.surface2,
              color: P.text,
              border: `1px solid ${P.border}`,
              fontWeight: 900,
            }}
          >
            {(v.uploaderName || "U")[0]?.toUpperCase?.() || "U"}
          </Avatar>

          <Box>
            <Typography sx={{ color: P.text, fontWeight: 800, lineHeight: 1.25 }}>
              {v.uploaderName || "Someone"} uploaded:{" "}
              <Typography component="span" sx={{ fontWeight: 500 }}>
                {v.title}
              </Typography>
            </Typography>

            <Typography sx={{ color: P.subtext, fontSize: 13, mt: 0.4 }}>
              {timeAgo(v.createdAt)}
            </Typography>
          </Box>

          <Box
            component="img"
            src={v.thumbnail || "https://via.placeholder.com/160x90?text=Video"}
            alt={v.title}
            sx={{
              width: 86,
              aspectRatio: "16 / 9",
              objectFit: "cover",
              borderRadius: 2,
              border: `1px solid ${P.border}`,
            }}
          />
        </Box>
      ))}

      {videos.length === 0 && (
        <Typography sx={{ color: P.subtext, px: 2, py: 2 }}>
          No notifications yet ✨
        </Typography>
      )}
    </Box>
  </Box>
</Popover>

<Menu
  anchorEl={createAnchor}
  open={Boolean(createAnchor)}
  onClose={() => setCreateAnchor(null)}
>
  <MenuItem
    onClick={() => {
      setCreateAnchor(null);
      navigate("/upload");
    }}
  >
    <ListItemIcon>
      <VideoCallIcon sx={{ color: P.accent }} />
    </ListItemIcon>
    <ListItemText primary="Upload video" />
  </MenuItem>

  <MenuItem
  onClick={() => {
    setCreateAnchor(null);
    navigate("/create-post");
  }}
>
  <ListItemIcon>
    <EditNoteIcon sx={{ color: P.accent }} />
  </ListItemIcon>
  <ListItemText primary="Create post" />
</MenuItem>
</Menu>

<Menu
  anchorEl={profileAnchor}
  open={Boolean(profileAnchor)}
  onClose={() => setProfileAnchor(null)}
>
  {user ? (
    <Box sx={{ px: 2, py: 1 }}>
      <Typography sx={{ fontWeight: 900, color: P.text }}>
        {user.username}
      </Typography>
      <Typography sx={{ fontSize: 13, color: P.subtext }}>
        {user.email}
      </Typography>
    </Box>
  ) : (
    <MenuItem
      onClick={() => {
        setProfileAnchor(null);
        navigate("/login");
      }}
    >
      Login
    </MenuItem>
  )}

  <Divider sx={{ borderColor: P.border }} />

  {user && (
    <MenuItem
      onClick={() => {
        setProfileAnchor(null);
        navigate("/profile");
      }}
    >
      <ListItemIcon>
        <AccountCircleIcon sx={{ color: P.accent }} />
      </ListItemIcon>
      <ListItemText primary="Your profile" />
    </MenuItem>
  )}

  <MenuItem
    onClick={() => {
      setProfileAnchor(null);
      navigate("/settings");
    }}
  >
    <ListItemIcon>
      <SettingsIcon sx={{ color: P.accent }} />
    </ListItemIcon>
    <ListItemText primary="Settings" />
  </MenuItem>

  {user && (
    <MenuItem onClick={logout} sx={{ color: "#C0406D" }}>
      <ListItemIcon>
        <LogoutIcon sx={{ color: "#C0406D" }} />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </MenuItem>
  )}
</Menu>

      {/* Left Mini Sidebar */}
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
    gap: 3,
    zIndex: 10,
  }}
>
  <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>

    <Box sx={{ textAlign: "center", color: P.text }}>
      <HomeIcon sx={{ color: P.accent }} />
      <Typography sx={{ fontSize: 11 }}>Home</Typography>
    </Box>
  </Link>

  <Box
  onClick={() => setCategory("Shorts")}
  sx={{
    textAlign: "center",
    color: P.text,
    cursor: "pointer",
  }}
>
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
  sx={{
    textAlign: "center",
    color: P.text,
    cursor: "pointer",
  }}
>
  <AccountCircleIcon sx={{ color: P.accent }} />
  <Typography sx={{ fontSize: 11 }}>You</Typography>
</Box>
</Box>

      {/* Sidebar */}
      <Drawer
  open={drawerOpen}
  variant="persistent"
  
  ModalProps={{
    keepMounted: true,
    sx: {
      zIndex: 1200,
    },
  }}
>
  {drawer}
</Drawer>

      {/* Content */}
      <Box
  sx={{
    ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
    px: { xs: 3, md: 3 },
    py: 2,
  }}
>
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

       {/* Videos + Shorts layout */}
<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    width: "100%",
     mt: 7,
  }}
>
  <Box
    sx={{
      width: "100%",
      maxWidth: "1500px",
    }}
  >
    {/* First few normal videos */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: "20px",
      }}
    >
      {topVideos.map((v) => (
        <VideoCard
          key={v._id}
          video={v}
          onDeleted={(id) =>
            setVideos((prev) => prev.filter((video) => video._id !== id))
          }
        />
      ))}
    </Box>

    {/* Shorts section after first row */}
    <ShortsSection
  shorts={shortsVideos}
  onDeleted={(id) =>
    setVideos((prev) => prev.filter((video) => video._id !== id))
  }
/>

    {/* Remaining normal videos */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: "20px",
      }}
    >
      {bottomVideos.map((v) => (
        <VideoCard
          key={v._id}
          video={v}
          onDeleted={(id) =>
            setVideos((prev) => prev.filter((video) => video._id !== id))
          }
        />
      ))}
    </Box>
  </Box>
</Box>

        {videos.length === 0 && !err && (
          <Typography sx={{ color: P.subtext, mt: 2 }}>
            No videos yet. Upload one and make it cute ✨
          </Typography>
        )}
      </Box>
    </Box>
  );
}