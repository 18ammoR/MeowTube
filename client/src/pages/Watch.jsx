import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getToken } from "../api";
import CommentsSection from "../components/CommentsSection.jsx";

function ytEmbedUrl(youtubeUrl, videoId) {
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  // fallback: attempt from url (optional)
  return youtubeUrl?.includes("watch?v=")
    ? youtubeUrl.replace("watch?v=", "embed/")
    : youtubeUrl?.replace("youtu.be/", "www.youtube.com/embed/");
}

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [subBusy, setSubBusy] = useState(false);

  const token = getToken();
const myId = token ? JSON.parse(atob(token.split(".")[1])).id : null;
const isOwner = myId && video?.userId === myId;

  // local UI state (since your backend doesn't have "did I like/subscribed?" endpoints yet)
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const tokenExists = !!getToken();

  const embed = useMemo(() => {
    if (!video) return "";
    return ytEmbedUrl(video.youtubeUrl, video.videoId);
  }, [video]);

  async function handleDelete() {
  if (!tokenExists) {
    alert("Please login first.");
    return;
  }

  const ok = confirm("Delete this video? This cannot be undone.");
  if (!ok) return;

  try {
    await api.delete(`/videos/${id}`);
    alert("Video deleted!");
    window.location.href = "/";
  } catch (e) {
    alert(e?.response?.data?.error || e.message || "Failed to delete video");
  }
}

  async function loadVideo() {
    try {
      setErr("");
      const res = await api.get(`/videos/${id}`);
      setVideo(res.data);
      // optional: reset local toggles when changing videos
      setLiked(false);
      setDisliked(false);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  }

  useEffect(() => {
    (async () => {
      await loadVideo();
      // increment views (no auth needed)
      try {
        await api.post(`/videos/${id}/view`);
      } catch (_) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleLike(action) {
    if (!tokenExists) {
      alert("Please login first (token missing).");
      return;
    }
    try {
      setBusy(true);
      const res = await api.post(`/videos/${id}/like`, { action }); // like/dislike
      // update counts
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              likeCount: res.data.likeCount,
              dislikeCount: res.data.dislikeCount,
            }
          : prev
      );

      // optimistic local toggle
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
      alert("Please login first (token missing).");
      return;
    }
    if (!video?.userId) return;

    try {
      setSubBusy(true);
      const res = await api.post(`/users/${video.userId}/subscribe`);
      // response: { subscribed: true/false, subscribers: number }
      setSubscribed(res.data.subscribed);
      // update displayed subscriber count (if you store it on video, otherwise ignore)
      setVideo((prev) => (prev ? { ...prev, uploaderSubscribers: res.data.subscribers } : prev));
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setSubBusy(false);
    }
  }

  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;
  if (!video) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
      <div>
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", border: "1px solid #eee" }}>
          <iframe
            src={embed}
            title={video.title}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
            allowFullScreen
          />
        </div>

        <h2 style={{ marginTop: 12 }}>{video.title}</h2>
        <div style={{ color: "#555", marginBottom: 12 }}>
          {video.views} views
        </div>

        {/* uploader + subscribe */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold" }}>{video.uploaderName || "Unknown"}</div>
            {/* uploaderSubscribers is optional (only updates if you keep it) */}
            {typeof video.uploaderSubscribers === "number" && (
              <div style={{ fontSize: 13, color: "#666" }}>{video.uploaderSubscribers} subscribers</div>
            )}
          </div>

          {isOwner && (
  <button
    onClick={handleDelete}
    style={{
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid #f3b3c8",
      cursor: "pointer",
      background: "#fff0f7",
      fontWeight: "bold",
      color: "#a12a52",
    }}
  >
    Delete
  </button>
)}

          <button
            onClick={handleSubscribe}
            disabled={subBusy}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer",
              background: subscribed ? "#f2f2f2" : "white",
              fontWeight: "bold",
            }}
          >
            {subBusy ? "…" : subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>

        {/* like/dislike */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => handleLike("like")}
            disabled={busy}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer",
              background: liked ? "#f2f2f2" : "white",
            }}
          >
            👍 Like {video.likeCount ?? 0}
          </button>

          <button
            onClick={() => handleLike("dislike")}
            disabled={busy}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer",
              background: disliked ? "#f2f2f2" : "white",
            }}
          >
            👎 Dislike {video.dislikeCount ?? 0}
          </button>
        </div>

        <div style={{ whiteSpace: "pre-wrap", color: "#333" }}>
          {video.description || ""}
        </div>

        <CommentsSection videoId={id} />

{!tokenExists && (
  <p style={{ marginTop: 14, color: "#b00" }}>
    (You can watch without logging in, but Like/Subscribe needs a token.)
  </p>
)}

        {!tokenExists && (
          <p style={{ marginTop: 14, color: "#b00" }}>
            (You can watch without logging in, but Like/Subscribe needs a token.)
          </p>
        )}
      </div>

      {/* right side: placeholder for “Up next” later */}
      <div>
        <h3>Up next (later)</h3>
        <p style={{ color: "#666" }}>We can add recommended videos next.</p>
      </div>
    </div>
  );
}