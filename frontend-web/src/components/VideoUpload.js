import API_BASE from "../config";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import ResultCard from "./ResultCard";
import InstallBanner from "./InstallBanner";
import AdminDashboard from "../admin/AdminDashboard";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import "./VideoUpload.css";

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [showAdmin, setShowAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const { theme, mode, toggle } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    axios.get(`${API_BASE}/api/v1/auth/me`)
      .then(res => setUserInfo(res.data))
      .catch(() => {});
  }, []);

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles?.length) return;
    setFile(acceptedFiles[0]);
    setResult(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "video/*",
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError("File too large (max 100MB)");
      return;
    }

    setUploading(true);
    setUploadPct(0);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/detect/video`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (!e.total) return;
            setUploadPct(Math.round((e.loaded * 100) / e.total));
          }
        }
      );
      setResult(res.data);
    } catch (err) {
      setError(
        err.response
          ? `Server ${err.response.status}`
          : "Backend not reachable"
      );
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.background,
      color: theme.text,
      padding: 40,
      textAlign: "center",
      position: "relative"
    }}>
      <h1>🔍 TruthLens</h1>

      {/* Top bar */}
      <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 10 }}>
        <span>👤 {user?.username || "Guest"}</span>

        {userInfo?.is_admin && !showAdmin && (
          <button onClick={() => setShowAdmin(true)}>🛡️ Admin</button>
        )}

        <button onClick={handleLogout}>Logout</button>
        <button onClick={toggle}>{mode === "dark" ? "☀️" : "🌙"}</button>
      </div>

      {showAdmin ? (
        <AdminDashboard onBack={() => setShowAdmin(false)} />
      ) : (
        <>
          <p className="subtitle">AI Powered Deepfake Detection</p>

          {!result && (
            <>
              {/* ✅ Accessible Dropzone */}
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? "active" : ""}`}
                role="button"
                aria-label="Upload video by clicking or dragging"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    getRootProps().onClick?.(e);
                  }
                }}
              >
                <input {...getInputProps()} />
                {file ? <p>{file.name}</p> : <p>📤 Upload video</p>}
              </div>

              <p>Max 100MB (MP4, AVI, MOV)</p>

              {file && !uploading && (
                <button
                  onClick={handleUpload}
                  className="upload-btn"
                  aria-label={`Analyze ${file.name}`}
                  aria-busy={uploading}
                >
                  🔍 Analyze
                </button>
              )}

              {uploading && (
                <p>{uploadPct < 100 ? `Uploading ${uploadPct}%` : "Analyzing..."}</p>
              )}
            </>
          )}

          {/* ✅ Error */}
          {error && (
            <div role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {/* ✅ Result */}
          {result && (
            <div role="region" aria-live="polite">
              <ResultCard result={result} />
            </div>
          )}

          <InstallBanner />
        </>
      )}
    </div>
  );
}

export default VideoUpload;