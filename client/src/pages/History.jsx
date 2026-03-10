import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getToken } from "../api";
import { Box, Paper, Typography, Button, Divider } from "@mui/material";

const P = {
  bg: "#FFF7FB",
  surface: "#FFFFFF",
  surface2: "#FFF0F7",
  border: "#F6C6DA",
  text: "#3B2A34",
  subtext: "#7A5D6B",
  accent: "#FF7FB0",
};

export default function History() {
  const token = getToken();
  const [items, setItems] = useState([]); // { videoId, watchedAt, video? }
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // de-dupe by videoId, keep latest watchedAt
  const dedupe = (rows) => {
    const map = new Map();
    for (const r of rows) {
      const prev = map.get(r.videoId);
      if (!prev || (r.watchedAt || 0) > (prev.watchedAt || 0)) map.set(r.videoId, r);
    }
    return [...map.values()].sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));
  };

  useEffect(() => {
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setErr("");
        setLoading(true);

        const hist = await api.get("/history"); // GET /api/history (auth)
        const rows = dedupe(hist.data || []);

        // fetch video details for each videoId
        const vids = await Promise.all(
          rows.map(async (h) => {
            try {
              const v = await api.get(`/videos/${h.videoId}`);
              return { ...h, video: v.data };
            } catch {
              return { ...h, video: null };
            }
          })
        );

        setItems(vids);
      } catch (e) {
        setErr(e?.response?.data?.error || e.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function clearHistory() {
    const ok = confirm("Clear watch history?");
    if (!ok) return;
    try {
      await api.delete("/history"); // DELETE /api/history (auth)
      setItems([]);
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Failed to clear history");
    }
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
          History
        </Typography>

        <Box sx={{ flex: 1 }} />

        {token && (
          <Button
            onClick={clearHistory}
            variant="contained"
            sx={{ bgcolor: P.accent, borderRadius: 999, fontWeight: 800, "&:hover": { bgcolor: P.accent } }}
          >
            Clear history
          </Button>
        )}
      </Box>

      {!token ? (
        <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${P.border}` }}>
          <Typography sx={{ color: P.subtext }}>
            Please login to view your watch history.
          </Typography>
        </Paper>
      ) : loading ? (
        <Typography sx={{ color: P.subtext }}>Loading…</Typography>
      ) : err ? (
        <Typography sx={{ color: "crimson" }}>{err}</Typography>
      ) : items.length === 0 ? (
        <Typography sx={{ color: P.subtext }}>No history yet.</Typography>
      ) : (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {items.map((h) => (
            <Paper key={h.videoId} sx={{ p: 2, borderRadius: 3, border: `1px solid ${P.border}` }}>
              <Typography sx={{ fontWeight: 900, color: P.text }}>
                {h.video?.title || "Video not found"}
              </Typography>
              <Typography sx={{ color: P.subtext, fontSize: 13 }}>
                Watched: {new Date(h.watchedAt).toLocaleString()}
              </Typography>
              <Divider sx={{ my: 1, borderColor: P.border }} />
              <Link to={`/watch/${h.videoId}`} style={{ textDecoration: "none" }}>
                <Button variant="outlined" sx={{ borderColor: P.border, color: P.text, borderRadius: 999 }}>
                  Open
                </Button>
              </Link>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}