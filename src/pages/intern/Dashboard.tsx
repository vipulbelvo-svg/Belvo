/**
 * Intern Portal – Team Manager Dashboard
 * UI matches the public About page TeamSection exactly.
 * Edit / delete controls are overlaid on top of the same cards.
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Plus, Pencil, Trash2, X, Check, Camera,
  AlertTriangle, ExternalLink, RotateCcw,
} from "lucide-react";
import { isAuthenticated, getEmail, logout } from "@/lib/intern-auth";
import { useTeamStore, type TeamEntry, type TeamMemberEntry } from "@/lib/team-store";
import { getTeamMemberImage } from "@/lib/team-images";

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const PRESET_COLORS = [
  { c: "#0b3b9c", lc: "#5ba9e6" },
  { c: "#007BFF", lc: "#66b2ff" },
  { c: "#7B2FBE", lc: "#9D4EDD" },
  { c: "#059669", lc: "#34d399" },
  { c: "#d97706", lc: "#fbbf24" },
  { c: "#dc2626", lc: "#f87171" },
  { c: "#0e7490", lc: "#22d3ee" },
  { c: "#be185d", lc: "#f472b6" },
];

// ─────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────

const inputSx: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, color: "#fff",
  fontFamily: "'Inter',sans-serif", fontSize: "0.85rem",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
};
const labelSx: React.CSSProperties = {
  display: "block", fontFamily: "'Inter',sans-serif",
  fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.14em",
  textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 6,
};
const focusV = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#7B2FBE");
const blurV  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "rgba(255,255,255,0.12)");

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 320;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          res(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        res(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => res(dataUrl);
      img.src = dataUrl;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────
// Confirm dialog
// ─────────────────────────────────────────────────────────

function Confirm({ message, onYes, onNo }: { message: string; onYes(): void; onNo(): void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "26px 28px", maxWidth: 360, width: "100%" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
          <AlertTriangle size={19} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.86rem", color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.55 }}>{message}</p>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onNo} style={{ padding: "8px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={onYes} style={{ padding: "8px 18px", background: "#ef4444", border: "none", borderRadius: 8, color: "#fff", fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Member modal – add or edit
// ─────────────────────────────────────────────────────────

function MemberModal({ teamId, teamColor, teamLightColor, initial, onClose }: {
  teamId: string; teamColor: string; teamLightColor: string;
  initial?: TeamMemberEntry; onClose(): void;
}) {
  const { addMember, updateMember } = useTeamStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [resp, setResp] = useState(initial?.responsibilities?.join(", ") ?? "");
  const [photo, setPhoto] = useState<string | null>(initial?.imageUrl ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initial;

  const localImg = initial ? getTeamMemberImage(initial.name) : undefined;
  const previewImg = photo || localImg;
  const previewInitials = getInitials(name || "?");

  const MAX_MB = 4;

  async function processFile(f: File) {
    setPhotoError("");
    if (!f.type.startsWith("image/")) { setPhotoError("Only image files are accepted."); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setPhotoError(`Max file size is ${MAX_MB} MB.`); return; }
    setPhoto(await fileToDataURL(f));
  }

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    await processFile(f);
    e.target.value = "";
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (!f) return;
    await processFile(f);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  function save() {
    if (!name.trim()) return;
    const patch = {
      name: name.trim(), role: role.trim() || undefined,
      responsibilities: resp.split(",").map(s => s.trim()).filter(Boolean),
      imageUrl: photo === "" ? null : (photo || initial?.imageUrl || null),
    };
    isEdit ? updateMember(teamId, initial!.id, patch) : addMember(teamId, patch);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", margin: 0 }}>
            {isEdit ? "Edit Member" : "Add Member"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4 }}><X size={17} /></button>
        </div>

        {/* ── Drag-and-drop photo zone ── */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
          style={{
            marginBottom: 22,
            borderRadius: 14,
            border: `2px dashed ${dragOver ? teamLightColor : "rgba(255,255,255,0.14)"}`,
            background: dragOver ? `${teamColor}12` : "rgba(255,255,255,0.025)",
            padding: previewImg ? "14px 16px" : "24px 16px",
            display: "flex", alignItems: "center", gap: 18,
            cursor: "pointer", transition: "all 0.18s",
            position: "relative",
          }}
        >
          {/* Avatar preview */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: previewImg ? "none" : `linear-gradient(135deg, ${teamColor}cc, ${teamLightColor}88)`,
              border: `2px solid ${dragOver ? teamLightColor : teamColor + "44"}`,
              boxShadow: `0 0 20px ${teamColor}22`,
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "border-color 0.18s",
            }}>
              {previewImg
                ? <img src={previewImg} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <>
                    <div style={{ position: "absolute", inset: 3, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
                    <Camera size={22} color="rgba(255,255,255,0.35)" style={{ position: "relative", zIndex: 1 }} />
                  </>
              }
            </div>
            {previewImg && (
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: `linear-gradient(135deg, ${teamColor}, ${teamLightColor})`, border: "2px solid #111118" }} />
            )}
          </div>

          {/* Text instructions */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {previewImg ? (
              <>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", margin: "0 0 3px", fontWeight: 500 }}>Photo uploaded</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>Click or drag to replace · max {MAX_MB} MB</p>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.82rem", color: dragOver ? teamLightColor : "rgba(255,255,255,0.55)", margin: "0 0 4px", fontWeight: 600, transition: "color 0.18s" }}>
                  {dragOver ? "Drop to upload" : "Drag & drop photo here"}
                </p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.28)", margin: 0 }}>
                  or click to browse · JPG, PNG, WEBP · max {MAX_MB} MB
                </p>
              </>
            )}
            {photoError && (
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.68rem", color: "#f87171", margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                ⚠ {photoError}
              </p>
            )}
          </div>

          {/* Remove button — only when photo set */}
          {photo && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setPhoto(""); setPhotoError(""); }}
              style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f87171", flexShrink: 0 }}
              title="Remove photo"
            >
              <X size={11} />
            </button>
          )}

          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelSx}>Full Name *</label>
            <input style={inputSx} value={name} autoFocus onChange={e => setName(e.target.value)} placeholder="e.g. Priya Sharma" onFocus={focusV} onBlur={blurV} />
          </div>
          <div>
            <label style={labelSx}>Role / Title</label>
            <input style={inputSx} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Team Lead" onFocus={focusV} onBlur={blurV} />
          </div>
          <div>
            <label style={labelSx}>Responsibilities (comma-separated)</label>
            <input style={inputSx} value={resp} onChange={e => setResp(e.target.value)} placeholder="e.g. UI Design, Code Review" onFocus={focusV} onBlur={blurV} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 22 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={!name.trim()} style={{ padding: "9px 20px", border: "none", borderRadius: 8, color: "#fff", background: name.trim() ? "linear-gradient(135deg,#7B2FBE,#9D4EDD)" : "rgba(123,47,190,0.35)", fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: name.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} />{isEdit ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Department modal – add or edit
// ─────────────────────────────────────────────────────────

function DeptModal({ initial, onClose }: { initial?: TeamEntry; onClose(): void }) {
  const { addTeam, updateTeam } = useTeamStore();
  const [name, setName]         = useState(initial?.name ?? "");
  const [deptId, setDeptId]     = useState(initial?.id ?? "");
  const [color, setColor]       = useState(initial?.color ?? PRESET_COLORS[0].c);
  const [lightColor, setLightColor] = useState(initial?.lightColor ?? PRESET_COLORS[0].lc);
  const [resp, setResp]         = useState(initial?.responsibilities?.join(", ") ?? "");
  const isEdit = !!initial;

  function save() {
    if (!name.trim()) return;
    const id = deptId || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    isEdit
      ? updateTeam(initial!.id, { name: name.trim(), color, lightColor, responsibilities: resp.split(",").map(s => s.trim()).filter(Boolean) })
      : addTeam({ id, name: name.trim(), color, lightColor, responsibilities: resp.split(",").map(s => s.trim()).filter(Boolean) });
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", margin: 0 }}>
            {isEdit ? "Edit Department" : "New Department"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4 }}><X size={17} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelSx}>Department Name *</label>
            <input style={inputSx} value={name} autoFocus
              onChange={e => { setName(e.target.value); if (!isEdit) setDeptId(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
              placeholder="e.g. Machine Learning" onFocus={focusV} onBlur={blurV} />
          </div>
          {!isEdit && (
            <div>
              <label style={labelSx}>ID (auto)</label>
              <input style={{ ...inputSx, color: "rgba(255,255,255,0.3)", cursor: "default" }} value={deptId} readOnly />
            </div>
          )}
          <div>
            <label style={labelSx}>Accent Color</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {PRESET_COLORS.map(bc => (
                <button key={bc.c} type="button" onClick={() => { setColor(bc.c); setLightColor(bc.lc); }}
                  style={{ width: 26, height: 26, borderRadius: "50%", background: bc.c, padding: 0, border: color === bc.c ? `3px solid ${bc.lc}` : "3px solid transparent", boxShadow: color === bc.c ? `0 0 0 2px #111118, 0 0 0 4px ${bc.c}` : "none", cursor: "pointer" }} />
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  style={{ width: 26, height: 26, border: "none", borderRadius: 4, cursor: "pointer", padding: 0, background: "none" }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.66rem", color: "rgba(255,255,255,0.3)" }}>Custom</span>
              </label>
            </div>
          </div>
          <div>
            <label style={labelSx}>Responsibilities (comma-separated)</label>
            <input style={inputSx} value={resp} onChange={e => setResp(e.target.value)} placeholder="e.g. Frontend, API" onFocus={focusV} onBlur={blurV} />
          </div>
        </div>

        {/* Preview — same header style as public page */}
        <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(255,255,255,0.025)", borderRadius: 10, border: `1px solid ${color}30`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 3, height: 22, background: `linear-gradient(180deg, ${color}, transparent)`, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#fff" }}>{name || "Department Name"}</span>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${color}28, transparent)` }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: lightColor }}>preview</span>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={!name.trim()} style={{ padding: "9px 20px", border: "none", borderRadius: 8, color: "#fff", background: name.trim() ? "linear-gradient(135deg,#7B2FBE,#9D4EDD)" : "rgba(123,47,190,0.35)", fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: name.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} />{isEdit ? "Save" : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Member card — same exact design as public page + edit overlays
// ─────────────────────────────────────────────────────────

function MemberCard({ member, team }: { member: TeamMemberEntry; team: TeamEntry }) {
  const { updateMember, removeMember } = useTeamStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const localImg = getTeamMemberImage(member.name);
  const img = member.imageUrl || localImg;
  const inits = getInitials(member.name);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    updateMember(team.id, member.id, { imageUrl: await fileToDataURL(f) });
    e.target.value = "";
  }, [team.id, member.id, updateMember]);

  return (
    <>
      {/* ── Horizontal card: photo left, name+role right ── */}
      <div style={{
        display: "flex", flexDirection: "row", alignItems: "center",
        gap: 14, padding: "14px 16px",
        background: "var(--belvo-bg-card)",
        border: "1px solid var(--belvo-border-card)",
        borderRadius: "16px",
        position: "relative", overflow: "hidden",
        backdropFilter: "blur(14px)",
      }}>
        {/* Left glow behind avatar */}
        <div style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: 60, height: 60, background: `radial-gradient(ellipse at center, ${team.color}30, transparent 70%)`, filter: "blur(10px)", pointerEvents: "none" }} />

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: img ? "none" : `linear-gradient(135deg, ${team.color}cc, ${team.lightColor}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${team.color}44`, boxShadow: `0 0 18px ${team.color}22`,
            position: "relative", overflow: "hidden",
          }}>
            {img
              ? <img src={img} alt={member.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              : <>
                  <div style={{ position: "absolute", inset: 3, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
                  <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}>{inits}</span>
                </>
            }
            {/* Camera on hover */}
            <button type="button" onClick={() => fileRef.current?.click()} title="Change photo"
              style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.18s", zIndex: 3 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0")}>
              <Camera size={15} color="#fff" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          </div>
          {/* Status dot */}
          <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: `linear-gradient(135deg, ${team.color}, ${team.lightColor})`, border: "2px solid var(--belvo-bg)" }} />
        </div>

        {/* Name + role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--belvo-text-1)", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {member.name}
          </p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: team.lightColor, margin: "3px 0 0" }}>
            {member.role?.trim() || team.name}
          </p>
          {member.responsibilities && member.responsibilities.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
              {member.responsibilities.map(r => (
                <span key={r} style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--belvo-text-2)", background: "var(--belvo-bg-card-2)", border: "1px solid var(--belvo-border-card)", borderRadius: "100px", padding: "2px 7px" }}>{r}</span>
              ))}
            </div>
          )}
        </div>

        {/* Edit / Delete */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          <button onClick={() => setEditOpen(true)} title="Edit"
            style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.45)" }}>
            <Pencil size={11} />
          </button>
          <button onClick={() => setConfirmDel(true)} title="Remove"
            style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.16)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444" }}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {editOpen && <MemberModal teamId={team.id} teamColor={team.color} teamLightColor={team.lightColor} initial={member} onClose={() => setEditOpen(false)} />}
      {confirmDel && <Confirm message={`Remove "${member.name}" from ${team.name}?`} onYes={() => { removeMember(team.id, member.id); setConfirmDel(false); }} onNo={() => setConfirmDel(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Admin group — mirrors public AdminGroup exactly + edit controls
// ─────────────────────────────────────────────────────────

function AdminGroupSection({ team }: { team: TeamEntry }) {
  const { removeTeam } = useTeamStore();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editDeptOpen,  setEditDeptOpen]  = useState(false);
  const [confirmDel,    setConfirmDel]    = useState(false);

  return (
    <>
      <div style={{ marginBottom: "64px", width: "100%" }}>
        {/* ADMINISTRATION divider — same as public page */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40, marginTop: 16 }}>
          <div style={{ flex: 1, height: 1, background: "var(--belvo-border-card)" }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#007BFF", background: "rgba(0,123,255,0.1)", border: "0.5px solid rgba(0,123,255,0.3)", borderRadius: "100px", padding: "5px 16px", margin: "0 16px" }}>
            ADMINISTRATION
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--belvo-border-card)" }} />
        </div>

        {/* Dept action row */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={() => setAddMemberOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(0,123,255,0.12)", border: "1px solid rgba(0,123,255,0.3)", borderRadius: 8, color: "#66b2ff", fontFamily: "'Inter',sans-serif", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            <Plus size={12} /> Add Member
          </button>
          <button onClick={() => setEditDeptOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>
            <Pencil size={12} /> Edit Dept
          </button>
          <button onClick={() => setConfirmDel(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8, color: "#ef4444", fontFamily: "'Inter',sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>
            <Trash2 size={12} /> Delete Dept
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {team.members.map(m => <MemberCard key={m.id} member={m} team={team} />)}
        </div>
      </div>

      {addMemberOpen && <MemberModal teamId={team.id} teamColor={team.color} teamLightColor={team.lightColor} onClose={() => setAddMemberOpen(false)} />}
      {editDeptOpen  && <DeptModal initial={team} onClose={() => setEditDeptOpen(false)} />}
      {confirmDel    && <Confirm message={`Delete "${team.name}" and all ${team.members.length} member(s)?`} onYes={() => { removeTeam(team.id); setConfirmDel(false); }} onNo={() => setConfirmDel(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Regular team group — mirrors public TeamGroup exactly + edit controls
// ─────────────────────────────────────────────────────────

function TeamGroupSection({ team }: { team: TeamEntry }) {
  const { removeTeam } = useTeamStore();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editDeptOpen,  setEditDeptOpen]  = useState(false);
  const [confirmDel,    setConfirmDel]    = useState(false);

  return (
    <>
      <div style={{ marginBottom: "64px", width: "100%" }}>
        {/* Team header — same as public page + action buttons on right */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <div style={{ width: 3, height: 22, background: `linear-gradient(180deg, ${team.color}, transparent)`, borderRadius: 2, flexShrink: 0 }} />
          <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: "clamp(0.95rem, 2vw, 1.15rem)", color: "var(--belvo-text-1)", margin: 0, letterSpacing: "-0.01em" }}>
            {team.name}
          </h3>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${team.color}28, transparent)` }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--belvo-text-4)" }}>
            {team.members.length} {team.members.length <= 1 ? "member" : "members"}
          </span>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => setAddMemberOpen(true)} title="Add member"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", background: `${team.color}18`, border: `1px solid ${team.color}35`, borderRadius: 7, color: team.lightColor, fontFamily: "'Inter',sans-serif", fontSize: "0.67rem", fontWeight: 600, cursor: "pointer" }}>
              <Plus size={11} /> Add
            </button>
            <button onClick={() => setEditDeptOpen(true)} title="Edit department"
              style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
              <Pencil size={12} />
            </button>
            <button onClick={() => setConfirmDel(true)} title="Delete department"
              style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444" }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Member grid — horizontal cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {team.members.map(m => <MemberCard key={m.id} member={m} team={team} />)}
          {team.members.length === 0 && (
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.25)", margin: "8px 0" }}>
              No members yet — click <strong style={{ color: team.lightColor }}>Add</strong>.
            </p>
          )}
        </div>
      </div>

      {addMemberOpen && <MemberModal teamId={team.id} teamColor={team.color} teamLightColor={team.lightColor} onClose={() => setAddMemberOpen(false)} />}
      {editDeptOpen  && <DeptModal initial={team} onClose={() => setEditDeptOpen(false)} />}
      {confirmDel    && <Confirm message={`Delete "${team.name}" and all ${team.members.length} member(s)?`} onYes={() => { removeTeam(team.id); setConfirmDel(false); }} onNo={() => setConfirmDel(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Main dashboard
// ─────────────────────────────────────────────────────────

export default function InternDashboard() {
  const [, navigate] = useLocation();
  const { teams, resetToDefaults } = useTeamStore();
  const [newDeptOpen,   setNewDeptOpen]   = useState(false);
  const [confirmReset,  setConfirmReset]  = useState(false);
  const username = getEmail();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/intern/login");
  }, [navigate]);

  const adminTeam    = teams.find(t => t.id === "admin");
  const regularTeams = teams.filter(t => t.id !== "admin");

  return (
    <div style={{ background: "var(--belvo-bg)", minHeight: "100dvh", position: "relative", overflow: "hidden" }}>

      {/* ── Same background blobs as public page ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--belvo-border-divider), transparent)" }} />
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "70vw", height: 400, background: "radial-gradient(ellipse at center, var(--belvo-glow-blob) 0%, transparent 65%)", filter: "blur(70px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 120px", position: "relative", zIndex: 1 }}>

        {/* ── Top bar (portal chrome — not on public page) ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/belvo-logo-transparent.png" alt="BELVO" style={{ height: 22, width: "auto" }} />
            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9D4EDD" }}>Team Manager</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="/#team" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter',sans-serif", fontSize: "0.74rem", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#9D4EDD")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
              <ExternalLink size={12} /> Live View
            </a>
            <button onClick={() => setConfirmReset(true)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter',sans-serif", fontSize: "0.74rem", cursor: "pointer" }}>
              <RotateCcw size={12} /> Reset
            </button>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>{username}</span>
            <button onClick={() => { logout(); navigate("/intern/login"); }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.38)", fontFamily: "'Inter',sans-serif", fontSize: "0.74rem", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>

        {/* ── Same page heading as public page ── */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <span style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "0.68rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "#0b3b9c", marginBottom: 14 }}>
            Our Team
          </span>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.8rem)", lineHeight: 1.05, color: "var(--belvo-text-1)", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
            The BELVO <span style={{ color: "#0b3b9c" }}>Collective</span>
          </h2>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.95rem", lineHeight: 1.75, color: "var(--belvo-text-3)", maxWidth: 520, margin: "0 auto", letterSpacing: "0.01em" }}>
            Meet the talented people building exceptional digital experiences together.
          </p>
        </div>

        {/* ── Regular teams ── */}
        {regularTeams.map(team => <TeamGroupSection key={team.id} team={team} />)}

        {/* ── Admin / HR ── */}
        {adminTeam && <AdminGroupSection team={adminTeam} />}

        {/* ── Add Department — at the very bottom ── */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button onClick={() => setNewDeptOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 32px", background: "linear-gradient(135deg, #7B2FBE, #9D4EDD)", border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Inter',sans-serif", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 0 24px rgba(123,47,190,0.3)" }}>
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {newDeptOpen   && <DeptModal onClose={() => setNewDeptOpen(false)} />}
        {confirmReset  && <Confirm message="Reset all team data to factory defaults? All custom changes will be lost." onYes={() => { resetToDefaults(); setConfirmReset(false); }} onNo={() => setConfirmReset(false)} />}
      </AnimatePresence>
    </div>
  );
}
