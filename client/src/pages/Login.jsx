import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
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

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      // ✅ after login, go home
      nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: P.bg,
        display: "grid",
        placeItems: "center",
        p: 3,
        background:
          "radial-gradient(circle at top left, #FFE1EF 0, transparent 32%), radial-gradient(circle at bottom right, #FFD6E8 0, transparent 30%), #FFF7FB",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: 4,
          borderRadius: 5,
          bgcolor: "rgba(255,255,255,0.88)",
          border: `1px solid ${P.border}`,
          boxShadow: "0 20px 45px rgba(255, 127, 176, 0.18)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            component="img"
            src={meowtubeIcon}
            alt="MeowTube logo"
            sx={{
              width: 86,
              height: 86,
              objectFit: "contain",
              mb: 1,
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: P.text,
              letterSpacing: 0.3,
            }}
          >
            MeowTube
          </Typography>

          <Typography
            sx={{
              color: P.subtext,
              fontSize: 14,
              mt: 0.5,
            }}
          >
            Greetings and Salutations, cutie ✨
          </Typography>
        </Box>

        {/* Small lock avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: P.surface2,
              color: P.accent,
              border: `1px solid ${P.border}`,
              width: 46,
              height: 46,
            }}
          >
            <LockRoundedIcon />
          </Avatar>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            color: P.text,
            mb: 2,
            textAlign: "center",
          }}
        >
          Login
        </Typography>

        {err && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 3,
            }}
          >
            {err}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            display: "grid",
            gap: 2,
          }}
        >
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: P.bg,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: P.border,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: P.accent,
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: P.bg,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: P.border,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: P.accent,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 1,
              py: 1.2,
              borderRadius: 999,
              bgcolor: P.accent,
              color: "white",
              fontWeight: 900,
              textTransform: "none",
              fontSize: 16,
              boxShadow: "0 10px 22px rgba(255, 127, 176, 0.28)",
              "&:hover": {
                bgcolor: P.accent,
                transform: "translateY(-1px)",
                boxShadow: "0 14px 28px rgba(255, 127, 176, 0.35)",
              },
            }}
          >
            Login
          </Button>
        </Box>

        <Typography
          sx={{
            mt: 2.5,
            textAlign: "center",
            color: P.subtext,
            fontSize: 14,
          }}
        >
          No account?{" "}
          <Link
            to="/register"
            style={{
              color: P.accent,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Register
          </Link>
        </Typography>

        <Typography
          sx={{
            mt: 1,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          <Link
            to="/"
            style={{
              color: P.subtext,
              textDecoration: "none",
            }}
          >
            ← Back to Home
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}