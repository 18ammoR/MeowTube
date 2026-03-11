import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Box, Paper, TextField, Button, Typography, Alert } from "@mui/material";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      nav("/upload");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    }
  }

  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 420 }}>
         <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>
                <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 700,
            color: "#333333",
          }}
        >
          Login
        </Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button variant="contained" type="submit">Login</Button>
          <Typography variant="body2">
            No account? <Link to="/register">Register</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}