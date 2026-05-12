import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import AddIcon from "@mui/icons-material/Add";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import EditNoteIcon from "@mui/icons-material/EditNote";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import api, { getToken, clearToken } from "../api";
import CommentsSection from "../components/CommentsSection.jsx";
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

function ytEmbedUrl(youtubeUrl, videoId) {
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;

  return youtubeUrl?.includes("watch?v=")
    ? youtubeUrl.replace("watch?v=", "embed/")
    : youtubeUrl?.replace("youtu.be/", "www.youtube.com/embed/");
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
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

function WatchHeader({ user }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [createAnchor, setCreateAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  function onSearchSubmit(e) {
    e.preventDefault();
    navigate("/");
  }

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
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
            md: "260px 1fr 300px",
          },
          alignItems: "center",
          gap: 2,
          minHeight: `${TOP_BAR_HEIGHT}px`,
          width: "100%",
        }}
      >
        {/* Left */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => navigate("/")} sx={{ color: P.text }}>
            <MenuIcon />
          </IconButton>

          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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

        {/* Center Search */}
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

        {/* Right */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            justifySelf: "end",
            gap: 1,
            pr: 2,
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
                alert("Create post feature can be added later.");
              }}
            >
              <ListItemIcon>
                <EditNoteIcon sx={{ color: P.accent }} />
              </ListItemIcon>
              <ListItemText primary="Create post" />
            </MenuItem>
          </Menu>

          <IconButton
            onClick={() => navigate("/notifications")}
            sx={{
              color: P.text,
              bgcolor: P.surface2,
              border: `1px solid ${P.border}`,
              "&:hover": { bgcolor: P.accent2 },
            }}
          >
            <Badge badgeContent={0} color="error">
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function UpNextCard({ item, currentCategory }) {
  const navigate = useNavigate();
  const sameCategory =
    currentCategory &&
    String(item.category || "").toLowerCase().trim() === currentCategory;

  return (
    <Card
      onClick={() => navigate(`/watch/${item._id}`)}
      sx={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        gap: 1.2,
        cursor: "pointer",
        bgcolor: "transparent",
        boxShadow: "none",
        borderRadius: 2,
        p: 0.6,
        "&:hover": {
          bgcolor: P.surface2,
        },
      }}
    >
      <CardMedia
        component="img"
        image={
          item.thumbnail ||
          "https://via.placeholder.com/480x270?text=No+Thumbnail"
        }
        alt={item.title}
        sx={{
          width: "100%",
          aspectRatio: "16 / 9",
          objectFit: "cover",
          borderRadius: 2,
          border: `1px solid ${P.border}`,
        }}
      />

      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Typography
          sx={{
            fontWeight: 900,
            color: P.text,
            fontSize: 14,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        <Typography sx={{ color: P.subtext, fontSize: 13, mt: 0.4 }}>
          {item.uploaderName || "Unknown"}
        </Typography>

        <Typography sx={{ color: P.subtext, fontSize: 13 }}>
          {item.views ?? 0} views • {timeAgo(item.createdAt)}
        </Typography>

        {sameCategory && (
          <Chip
            label="Related"
            size="small"
            sx={{
              mt: 0.7,
              height: 22,
              bgcolor: P.surface,
              border: `1px solid ${P.border}`,
              color: P.accent,
              fontWeight: 800,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = getToken();
  const user = token ? decodeJwtPayload(token) : null;
  const tokenExists = !!token;

  const [video, setVideo] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [subBusy, setSubBusy] = useState(false);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const embed = useMemo(() => {
    if (!video) return "";
    return ytEmbedUrl(video.youtubeUrl, video.videoId);
  }, [video]);

  const currentCategory = String(video?.category || "")
    .toLowerCase()
    .trim();

  const upNextVideos = useMemo(() => {
    if (!video) return [];

    return allVideos
      .filter((v) => v._id !== id)
      .sort((a, b) => {
        const aRelated =
          currentCategory &&
          String(a.category || "").toLowerCase().trim() === currentCategory;

        const bRelated =
          currentCategory &&
          String(b.category || "").toLowerCase().trim() === currentCategory;

        if (aRelated && !bRelated) return -1;
        if (!aRelated && bRelated) return 1;

        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [allVideos, video, id, currentCategory]);

  async function loadData() {
  try {
    setErr("");

    const [videoRes, videosRes] = await Promise.all([
      api.get(`/videos/${id}`),
      api.get("/videos"),
    ]);

    setVideo(videoRes.data);
    setAllVideos(videosRes.data || []);
    setLiked(false);
    setDisliked(false);
    

    // ✅ check if current user is already subscribed to this uploader
    if (tokenExists && user?.id) {
      try {
        const me = await api.get(`/users/${user.id}`);
        const mySubscriptions = me.data.subscriptions || [];

        setSubscribed(mySubscriptions.includes(videoRes.data.userId));
      } catch (_) {
        setSubscribed(false);
      }
    } else {
      setSubscribed(false);
    }

    // increment views
    try {
      const viewRes = await api.post(`/videos/${id}/view`);
      setVideo((prev) =>
        prev ? { ...prev, views: viewRes.data.views } : prev
      );
    } catch (_) {}

    // save to history
    if (tokenExists) {
      try {
        await api.post(`/history/${id}`);
      } catch (_) {}
    }
  } catch (e) {
    setErr(e?.response?.data?.error || e.message);
  }
}

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleLike(action) {
    if (!tokenExists) {
      alert("Please login first.");
      return;
    }

    try {
      setBusy(true);
      const res = await api.post(`/videos/${id}/like`, { action });

      setVideo((prev) =>
        prev
          ? {
              ...prev,
              likeCount: res.data.likeCount,
              dislikeCount: res.data.dislikeCount,
            }
          : prev
      );

      if (action === "like") {
        setLiked((p) => !p);
        setDisliked(false);
      } else {
        setDisliked((p) => !p);
        setLiked(false);
      }
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubscribe() {
  if (!tokenExists) {
    alert("Please login first.");
    return;
  }

  if (!video?.userId) return;

  try {
    setSubBusy(true);

    const res = await api.post(`/users/${video.userId}/subscribe`);

    setSubscribed(res.data.subscribed);

    setVideo((prev) =>
      prev
        ? {
            ...prev,
            uploaderSubscribers: res.data.subscribers,
          }
        : prev
    );
  } catch (e) {
    alert(e?.response?.data?.error || e.message);
  } finally {
    setSubBusy(false);
  }
}

  if (err) {
    return (
      <Box sx={{ bgcolor: P.bg, minHeight: "100vh" }}>
        <WatchHeader user={user} />
        <Box sx={{ pt: `${TOP_BAR_HEIGHT + 24}px`, px: 3, color: "crimson" }}>
          {err}
        </Box>
      </Box>
    );
  }

  if (!video) {
    return (
      <Box sx={{ bgcolor: P.bg, minHeight: "100vh" }}>
        <WatchHeader user={user} />
        <Box sx={{ pt: `${TOP_BAR_HEIGHT + 24}px`, px: 3 }}>
          Loading…
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: P.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <WatchHeader user={user} />

      <Box
        sx={{
          pt: `${TOP_BAR_HEIGHT + 24}px`,
          px: { xs: 2, md: 4 },
          pb: 4,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 2fr) 430px",
          },
          gap: 3,
        }}
      >
        {/* Left video area */}
        <Box>
          <Paper
            sx={{
              position: "relative",
              paddingTop: "56.25%",
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${P.border}`,
              bgcolor: P.surface,
              boxShadow: "0 10px 25px rgba(255, 127, 176, 0.10)",
            }}
          >
            <iframe
              src={embed}
              title={video.title}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allowFullScreen
            />
          </Paper>

          <Typography
            variant="h5"
            sx={{ mt: 2, fontWeight: 900, color: P.text }}
          >
            {video.title}
          </Typography>

          <Typography sx={{ color: P.subtext, mt: 0.7 }}>
            {video.views ?? 0} views
          </Typography>

          {/* uploader row */}
          <Paper
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 3,
              border: `1px solid ${P.border}`,
              bgcolor: P.surface,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
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
              {(video.uploaderName || "U")[0].toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 900, color: P.text }}>
                {video.uploaderName || "Unknown"}
              </Typography>

              {typeof video.uploaderSubscribers === "number" && (
                <Typography sx={{ color: P.subtext, fontSize: 13 }}>
                  {video.uploaderSubscribers} subscribers
                </Typography>
              )}
            </Box>

            <Button
              onClick={handleSubscribe}
              disabled={subBusy}
              sx={{
                borderRadius: 999,
                px: 2,
                fontWeight: 900,
                color: subscribed ? P.text : "white",
                bgcolor: subscribed ? P.surface2 : P.accent,
                border: `1px solid ${P.border}`,
                textTransform: "none",
                "&:hover": {
                  bgcolor: subscribed ? P.surface2 : P.accent,
                },
              }}
            >
              {subBusy ? "…" : subscribed ? "Subscribed" : "Subscribe"}
            </Button>
          </Paper>

          {/* like/dislike */}
          <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
            <Button
              onClick={() => handleLike("like")}
              disabled={busy}
              sx={{
                borderRadius: 999,
                px: 2,
                bgcolor: liked ? P.accent2 : P.surface,
                border: `1px solid ${P.border}`,
                color: P.text,
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              👍 Like {video.likeCount ?? 0}
            </Button>

            <Button
              onClick={() => handleLike("dislike")}
              disabled={busy}
              sx={{
                borderRadius: 999,
                px: 2,
                bgcolor: disliked ? P.accent2 : P.surface,
                border: `1px solid ${P.border}`,
                color: P.text,
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              👎 Dislike {video.dislikeCount ?? 0}
            </Button>
          </Box>

          {/* description */}
          {video.description && (
            <Paper
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 3,
                border: `1px solid ${P.border}`,
                bgcolor: P.surface,
                color: P.text,
                whiteSpace: "pre-wrap",
              }}
            >
              {video.description}
            </Paper>
          )}

          {!tokenExists && (
            <Typography sx={{ mt: 2, color: "#C0406D" }}>
              You can watch without logging in, but Like/Subscribe/Comment needs
              login.
            </Typography>
          )}

          <CommentsSection videoId={id} />
        </Box>

        {/* Right up next */}
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: P.text, mb: 1 }}
          >
            Up next
          </Typography>

          {currentCategory && (
            <Typography sx={{ color: P.subtext, fontSize: 14, mb: 1.5 }}>
              Showing related videos first from{" "}
              <b>{video.category || "same category"}</b>
            </Typography>
          )}

          <Box sx={{ display: "grid", gap: 1 }}>
            {upNextVideos.map((item) => (
              <UpNextCard
                key={item._id}
                item={item}
                currentCategory={currentCategory}
              />
            ))}
          </Box>

          {upNextVideos.length === 0 && (
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${P.border}`,
                bgcolor: P.surface,
              }}
            >
              <Typography sx={{ color: P.subtext }}>
                No other uploaded videos yet.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}