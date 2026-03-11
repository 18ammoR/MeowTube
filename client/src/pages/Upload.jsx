import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Paper, TextField, Button, Typography, Alert } from "@mui/material";

export default function Upload() {
  const nav = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

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
        { youtubeUrl, title, description, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("Video submitted successfully!");
      // go to watch page
      nav(`/watch/${res.data._id}`);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    }
  }

  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 600 }}>
         <Typography   variant="h5"
          sx={{
            mb: 2,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 700,
            color: "#333333",
          }}>Submit a YouTube Video</Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField label="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} required />
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField label="Description" multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <TextField label="Category (e.g. Music, Gaming)" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Button variant="contained" type="submit">Submit</Button>
        </Box>
      </Paper>
    </Box>
  );
}

