import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { getToken } from "../api";

export default function Upload() {
  const nav = useNavigate();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!getToken()) {
      nav("/login");
    }
  }, [nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    const token = localStorage.getItem("token");

    if (!token) {
      setErr("Please login first.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/videos",
        {
          youtubeUrl,
          title,
          description,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMsg("Video submitted successfully!");
      nav(`/watch/${res.data._id}`);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
        display: "grid",
        placeItems: "center",
        bgcolor: "#FFF7FB",
      }}
    >
      <Paper
        sx={{
          p: 3,
          width: "100%",
          maxWidth: 600,
          borderRadius: 4,
          border: "1px solid #F6C6DA",
          boxShadow: "0 10px 25px rgba(255, 127, 176, 0.12)",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            sx={{
              mb: 2,
              borderRadius: 999,
              borderColor: "#F6C6DA",
              color: "#3B2A34",
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            ← Back to Home
          </Button>
        </Link>

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: 900,
            color: "#3B2A34",
          }}
        >
          Submit a YouTube Video
        </Typography>

        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}

        {msg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {msg}
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
            label="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            required
          />

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <TextField
            label="Description"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            label="Category (e.g. Music, Gaming, Shorts)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Button
            variant="contained"
            type="submit"
            sx={{
              borderRadius: 999,
              py: 1.2,
              bgcolor: "#FF7FB0",
              fontWeight: 800,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#FF7FB0",
              },
            }}
          >
            Submit
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}