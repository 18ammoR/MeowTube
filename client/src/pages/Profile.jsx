import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "@mui/material";
import api, { getToken } from "../api";

const P = {
  bg: "#FFF7FB",
  surface: "#FFFFFF",
  surface2: "#FFF0F7",
  border: "#F6C6DA",
  text: "#3B2A34",
  subtext: "#7A5D6B",
  accent: "#FF7FB0",
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

export default function Profile() {
  const token = getToken();
  const user = token ? decodeJwtPayload(token) : null;

  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      try {
        const res = await api.get(`/users/${user.id}`);
        setProfile(res.data);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message);
      }
    }

    loadProfile();
  }, [user?.id]);

  if (!token) {
    return (
      <Box sx={{ bgcolor: P.bg, minHeight: "100vh", p: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${P.border}` }}>
          <Typography sx={{ color: P.text, fontWeight: 900 }}>
            Please login to view your profile.
          </Typography>
          <Link to="/login">
            <Button sx={{ mt: 2 }}>Login</Button>
          </Link>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: P.bg, minHeight: "100vh", p: 3 }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button
          variant="outlined"
          sx={{ mb: 2, borderColor: P.border, color: P.text, borderRadius: 999 }}
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
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: P.accent,
              fontSize: 34,
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
            <Typography sx={{ color: P.subtext }}>
              {profile?.subscribers ?? 0} subscribers
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h5" sx={{ fontWeight: 900, color: P.text, mb: 2 }}>
        Your videos
      </Typography>

      {err && <Typography sx={{ color: "crimson" }}>{err}</Typography>}

      <Grid container spacing={2}>
        {(profile?.videos || []).map((v) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={v._id}>
            <Link to={`/watch/${v._id}`} style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${P.border}`,
                  overflow: "hidden",
                }}
              >
                <CardMedia
                  component="img"
                  image={v.thumbnail}
                  sx={{
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                  }}
                />
                <CardContent>
                  <Typography sx={{ color: P.text, fontWeight: 900 }}>
                    {v.title}
                  </Typography>
                  <Typography sx={{ color: P.subtext, fontSize: 13 }}>
                    {v.views ?? 0} views
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {profile?.videos?.length === 0 && (
        <Typography sx={{ color: P.subtext }}>No uploaded videos yet.</Typography>
      )}
    </Box>
  );
}