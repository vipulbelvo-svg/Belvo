import React, { useState } from "react";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, Video, Palette, TrendingUp, Code2, ShieldCheck, HeartHandshake } from "lucide-react";
import Footer from "@/sections/Footer";

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: easeOut },
  }),
};

const COLLABORATION_TRACKS = [
  {
    icon: <Video size={22} color="#c794ff" />,
    title: "UGC Creators & Video Editors",
    desc: "Direct-response creators, on-camera talent, and dynamic video editors who know how to hook an audience within the first 2 seconds.",
    deliverables: ["Reels & TikTok Direct-Response", "Commercial UGC Production", "Fast-Paced Hook Edits"],
  },
  {
    icon: <Palette size={22} color="#c794ff" />,
    title: "3D Motion & Visual Artists",
    desc: "CGI artists, blender wizards, and visual effects specialists creating commercial-grade product renders and kinetic typography.",
    deliverables: ["Photorealistic 3D Product Renders", "Kinetic Typography & Motion", "Visual Effects (VFX)"],
  },
  {
    icon: <TrendingUp size={22} color="#c794ff" />,
    title: "Performance & Media Buyers",
    desc: "Data-driven media buyers with proven track records scaling Meta, Google, and YouTube ad budgets with rigorous ROAS metrics.",
    deliverables: ["Multi-Channel Paid Ads", "Funnel Architecture & CRO", "Scale Attribution"],
  },
  {
    icon: <Code2 size={22} color="#c794ff" />,
    title: "Developers & Tech Specialists",
    desc: "Modern frontend engineers, headless Shopify architects, and full-stack developers building ultra-responsive web experiences.",
    deliverables: ["Headless E-Commerce & Shopify", "Next.js & React Applications", "Custom API Integrations"],
  },
];

export default function Partners() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    track: "UGC Creators & Video Editors",
    portfolioUrl: "",
    experience: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/book-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "partner-application",
          fullName: formData.fullName,
          email: formData.email,
          company: formData.phone,
          budget: formData.track,
          projectType: formData.portfolioUrl,
          message: formData.experience,
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to submit application right now.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Partner & Freelancer Network — Belvo Digital Agency | Mumbai"
        description="Join the Belvo Partner Network. Collaborate with Mumbai's premier digital marketing agency and creative studio on high-impact client campaigns."
        path="/partners"
      />

      {/* ── HERO BANNER ────────────────────────────────────────── */}
      <section
        style={{
          background: "#050308",
          padding: "clamp(80px, 10vw, 120px) 24px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translate(-50%, -50%)", width: "75vw", height: "55vh", background: "radial-gradient(ellipse at center, rgba(123,47,190,0.22) 0%, transparent 65%)", filter: "blur(80px)" }} />
        </div>

        <div style={{ maxWidth: "880px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(123, 47, 190, 0.14)",
              border: "1px solid rgba(123, 47, 190, 0.35)",
              color: "#c794ff",
              fontSize: "0.74rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "18px",
            }}
          >
            <Sparkles size={13} />
            Belvo Creator & Partner Collective
          </span>

          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)",
              lineHeight: 1.08,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: "0 0 20px",
            }}
          >
            Create with Us.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #c794ff, #F45B96)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Scale Ambitious Brands.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
              lineHeight: 1.8,
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: "680px",
              margin: "0 auto 36px",
            }}
          >
            We collaborate with elite independent creators, 3D artists, growth marketers, and engineers across India and globally to build campaigns for 100+ category-leading brands.
          </p>
        </div>
      </section>

      {/* ── COLLABORATION TRACKS ────────────────────────────────── */}
      <section style={{ background: "#08060f", padding: "40px 24px 80px", position: "relative" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#ffffff", margin: "0 0 10px" }}>
              Collaboration Tracks
            </h2>
            <p style={{ fontSize: "0.92rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
              Choose where your craft fits best within our agency client engagements.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "20px" }}>
            {COLLABORATION_TRACKS.map((t, i) => (
              <motion.div
                key={t.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                style={{
                  background: "rgba(18, 14, 26, 0.8)",
                  border: "1px solid rgba(130, 40, 200, 0.22)",
                  borderRadius: "18px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(123, 47, 190, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                    {t.icon}
                  </div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: "0 0 10px" }}>
                    {t.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "rgba(255, 255, 255, 0.65)", margin: "0 0 20px" }}>
                    {t.desc}
                  </p>
                </div>
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
                  {t.deliverables.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.75)", marginBottom: "4px" }}>
                      <CheckCircle2 size={13} color="#c794ff" /> {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM SECTION ────────────────────────────── */}
      <section style={{ background: "#050308", padding: "60px 24px 100px", position: "relative" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              background: "linear-gradient(145deg, rgba(22, 16, 34, 0.9), rgba(12, 9, 20, 0.95))",
              border: "1px solid rgba(130, 40, 200, 0.35)",
              borderRadius: "24px",
              padding: "clamp(28px, 4vw, 48px)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#c794ff", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                <HeartHandshake size={16} /> Partner Application
              </div>
              <h2 style={{ fontSize: "1.85rem", fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                Join the Belvo Network
              </h2>
              <p style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.65)", margin: 0 }}>
                Share your portfolio and past work. Our agency leads review applications weekly.
              </p>
            </div>

            {isSuccess ? (
              <div
                style={{
                  padding: "36px",
                  textAlign: "center",
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "16px",
                }}
              >
                <ShieldCheck size={48} color="#4ade80" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", margin: "0 0 8px" }}>
                  Application Received!
                </h3>
                <p style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.75)", margin: 0 }}>
                  Thank you for applying. Our talent curation team will review your portfolio and get in touch with relevant client project briefs.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
                      Primary Track *
                    </label>
                    <select
                      value={formData.track}
                      onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: "#181224",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    >
                      {COLLABORATION_TRACKS.map((t) => (
                        <option key={t.title} value={t.title} style={{ background: "#181224" }}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
                    Portfolio / Social Link (Behance, GitHub, Instagram, Google Drive) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
                    Brief Summary of Experience & Tools Used
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about the brands you've worked with, tools you master, and your typical turnaround times..."
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>

                {errorMsg && (
                  <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #7B2FBE, #a855f7)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    border: "none",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 8px 30px rgba(123, 47, 190, 0.4)",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Partner Application"} <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
