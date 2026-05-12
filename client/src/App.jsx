import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Watch from "./pages/Watch.jsx";
import Upload from "./pages/Upload.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import History from "./pages/History.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function TopBar() {
  const nav = useNavigate();
  const token = getToken();
  const user = token ? decodeJwtPayload(token) : null;

  function onLogout() {
    clearToken();
    nav("/");
    // quick refresh so UI updates everywhere
    window.location.reload();
  }

  return (
    <header style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 12, alignItems: "center" }}>
    <Link
      to="/"
      style={{
        textDecoration: "none",
        fontWeight: 900,
        fontFamily: "'Poppins', 'Comic Sans MS', cursive",
        color: "#ff4f8b",
        background: "#ffe4ec",
        padding: "6px 16px",
        borderRadius: "999px",
        border: "1px solid #ffc2d1",
        boxShadow: "0 4px 10px rgba(255,182,193,0.4)",
        display: "inline-flex",
        alignItems: "center",
        letterSpacing: "0.5px"
      }}
    >
      🐱 MeowTube
        </Link>
          <Link
      to="/upload"
      style={{
        textDecoration: "none",
        background: "linear-gradient(135deg, #ff4f8b, #ffc2d1)",
        color: "#ffffff",
        padding: "6px 16px",
         borderRadius: "999px",
        fontWeight: "700",
        fontFamily: "'Poppins', 'Comic Sans MS', cursive",
          boxShadow: "0 4px 10px rgba(255,182,193,0.35)",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      Upload ✨
    </Link>

      <div style={{ flex: 1 }} />

      {user ? (
        <>
        
        <span
      style={{
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "sans-serif",
        color: "#31282b",
        letterSpacing: "0.3px",
      }}
    >
      Hi, <b>{user.username}</b> 
    </span>
            <button
      onClick={onLogout}
      style={{
        padding: "8px 16px",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        background: "linear-gradient(135deg, #ffccd9, #ffd6e7)",
        color: "#ff4f8b",
        fontWeight: "700",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 12px rgba(255,182,193,0.35)",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      Logout 
    </button>
        </>
      ) : (
        <>
    <Link
      to="/login"
      style={{
        textDecoration: "none",
  color: "#ff4f8b",
        padding: "6px 16px",
         borderRadius: "999px",
        border: "1px solid #ffc2d1",
        fontWeight: "700",
         fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 12px rgba(255,182,193,0.35)",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      Login 
    </Link>
        <Link
      to="/register"
      style={{
        textDecoration: "none",
          background: "linear-gradient(135deg, #ffccd9, #ffd6e7)",
        color: "#ff4f8b",
        padding: "6px 16px",
         borderRadius: "999px",
        fontWeight: "700",
          fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 12px rgba(255,182,193,0.35)",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      🌸 Register
    </Link>
        </>
      )}
    </header>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/history" element={<History />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/create-post" element={<CreatePost />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
    </Routes>
  );
}