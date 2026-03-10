import { Link, useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Button, Divider } from "@mui/material";
import { clearToken, getToken } from "../api";

const P = {
  bg: "#FFF7FB",
  surface: "#FFFFFF",
  border: "#F6C6DA",
  text: "#3B2A34",
  subtext: "#7A5D6B",
  accent: "#FF7FB0",
};

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export default function Settings() {
  const nav = useNavigate();
  const token = getToken();
  const user = token ? decodeJwtPayload(token) : null;

  function logout() {
    clearToken();
    nav("/");
    window.location.reload();
  }

  return (
    <Box sx={{ bgcolor: P.bg, minHeight: "100vh", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button variant="outlined" sx={{ borderColor: P.border, color: P.text, borderRadius: 999 }}>
            ← Back
          </Button>
        </Link>
        <Typography variant="h5" sx={{ fontWeight: 900, color: P.text }}>
          Settings
        </Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${P.border}` }}>
        <Typography sx={{ fontWeight: 900, color: P.text, mb: 1 }}>Account</Typography>
        <Divider sx={{ mb: 1, borderColor: P.border }} />

        {user ? (
          <>
            <Typography sx={{ color: P.text }}>Username: <b>{user.username}</b></Typography>
            <Typography sx={{ color: P.subtext }}>Email: {user.email}</Typography>

            <Button
              onClick={logout}
              variant="contained"
              sx={{ mt: 2, bgcolor: P.accent, borderRadius: 999, fontWeight: 800, "&:hover": { bgcolor: P.accent } }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Typography sx={{ color: P.subtext }}>
            You are not logged in.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}