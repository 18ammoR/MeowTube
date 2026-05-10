import { Box, Paper, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const P = {
  bg: "#FFF7FB",
  surface: "#FFFFFF",
  border: "#F6C6DA",
  text: "#3B2A34",
  subtext: "#7A5D6B",
};

export default function Notifications() {
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
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900, color: P.text }}>
          Notifications
        </Typography>
        <Typography sx={{ color: P.subtext, mt: 1 }}>
          No notifications yet ✨
        </Typography>
      </Paper>
    </Box>
  );
}