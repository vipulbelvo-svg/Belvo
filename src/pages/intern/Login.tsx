import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Lock, Loader2, AlertCircle } from "lucide-react";
import { loginWithPassword } from "@/lib/intern-auth";

const VIOLET = {
  primary: "#7B2FBE",
  light: "#9D4EDD",
  glow: "rgba(123,47,190,0.3)",
};

export default function InternLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setError("");

    try {
      await loginWithPassword(username.trim(), password);
      navigate("/intern");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          background: `radial-gradient(circle, ${VIOLET.glow} 0%, transparent 70%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "40px 32px",
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/belvo-logo-transparent.png"
            alt="BELVO"
            style={{ height: "28px", width: "auto", marginBottom: "8px" }}
          />
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              margin: 0,
            }}
          >
            Intern Portal
          </p>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            marginBottom: "8px",
            lineHeight: 1.4,
          }}
        >
          This page belongs to the internals/employees
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Sign in with your team credentials to continue
        </p>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "10px",
              color: "#ef4444",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
            }}
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "8px",
                letterSpacing: "0.05em",
              }}
            >
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.3)",
                }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 42px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = VIOLET.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "8px",
                letterSpacing: "0.05em",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.3)",
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 42px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = VIOLET.primary;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            style={{
              width: "100%",
              padding: "14px",
              background:
                loading || !username.trim() || !password.trim()
                  ? "rgba(123,47,190,0.5)"
                  : `linear-gradient(135deg, ${VIOLET.primary}, ${VIOLET.light})`,
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor:
                loading || !username.trim() || !password.trim()
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.3s",
              boxShadow:
                loading || !username.trim() || !password.trim()
                  ? "none"
                  : `0 0 20px ${VIOLET.glow}`,
            }}
          >
            {loading ? (
              <Loader2
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  );
}
