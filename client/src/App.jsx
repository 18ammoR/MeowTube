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
      <Link to="/" style={{ textDecoration: "none" }}><b>🐱 MeowTube</b></Link>
      <Link to="/upload">Upload</Link>

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
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
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