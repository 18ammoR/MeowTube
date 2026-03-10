import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Watch from "./pages/Watch.jsx";
// (add these if you have them)
import Upload from "./pages/Upload.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import { getToken, clearToken } from "./api";

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
        background: "linear-gradient(135deg, #ff4f8b, #ffc2d1)", // dark pink to light pink
        color: "#ffffff", // white text
        padding: "6px 16px",
        borderRadius: "999px", // pill shape
        fontWeight: "700",
        fontFamily: "'Poppins', 'Comic Sans MS', cursive",
        boxShadow: "0 4px 10px rgba(255,182,193,0.35)", // soft shadow
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
          <span style={{ fontSize: 14 }}>Hi, <b>{user.username}</b></span>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer",
              background: "white",
              fontWeight: "bold",
            }}
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
      
        color: "#ff4f8b", // dark pink text
        padding: "6px 16px",
        borderRadius: "999px", // pill shape
        border: "1px solid #ffc2d1",
        fontWeight: "700",
        fontFamily: "Arial, sans-serif", // normal system font
        boxShadow: "0 4px 12px rgba(255,182,193,0.35)", // soft shadow
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
    background: "linear-gradient(135deg, #ffccd9, #ffd6e7)", // same soft pink gradient
    color: "#ff4f8b", // same dark pink text
    padding: "6px 16px",
    borderRadius: "999px", // same pill shape
    fontWeight: "700",
    fontFamily: "Arial, sans-serif", // same normal font
    boxShadow: "0 4px 12px rgba(255,182,193,0.35)", // same soft shadow
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
    <div>
      <TopBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />

        {/* only if you created these pages */}
        <Route path="/upload" element={<Upload />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}