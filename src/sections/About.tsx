import SEO from "@/components/SEO";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ExploreSection from "./ExploreSection";
import TeamSection from "./TeamSection";
import BookACall from "./BookACall";
import FAQ from "./FAQ";
import Footer from "./Footer";
import { MapPin, Sparkles, CheckCircle2 } from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: easeOut },
  }),
};

function Counter({ from = 0, to, duration = 2, suffix = "" }: { from?: number; to: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    let animId: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(from + (to - from) * eased));
      if (progress < 1) animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [inView, from, to, duration]);

  return (
    <span
      ref={ref}
      style={{
        background: "linear-gradient(135deg, #ffffff 40%, #c794ff 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {count}{suffix}
    </span>
  );
}

export default function About() {
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-120px" });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <>
      <SEO
        title="About Belvo — Integrated Digital Marketing & Creative Agency | Mumbai"
        description="Belvo is an integrated digital marketing agency and creative studio based in Goregaon, Mumbai. Discover how we partner with 100+ brands to build, scale, and dominate their categories."
        path="/about"
      />
      <section
        id="about"
        ref={sectionRef}
        style={{
          background: "#050308",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "visible",
          padding: "clamp(64px, 8vw, 104px) 24px 0",
        }}
      >
        <style>{`
          .about-blue-content {
            width: 100%;
          }
        `}</style>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(130,40,200,0.44), transparent)",
          }}
        />

        <motion.div
          style={{
            position: "absolute",
            top: "30%",
            left: "80%",
            transform: "translate(-50%, -50%)",
            width: "55vw",
            height: "55vw",
            maxWidth: "700px",
            maxHeight: "700px",
            background: "radial-gradient(ellipse at center, rgba(123,47,190,0.18) 0%, transparent 65%)",
            filter: "blur(80px)",
            pointerEvents: "none",
            y: bgY,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1240px",
            width: "100%",
            paddingBottom: "60px",
          }}
        >
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(123, 47, 190, 0.12)",
              border: "1px solid rgba(123, 47, 190, 0.35)",
              color: "#c794ff",
              fontSize: "0.82rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            <Sparkles size={14} /> Agency Narrative & Mission
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.7fr] gap-8 lg:gap-14 items-start">
            {/* Left Narrative Column */}
            <div>
              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                  lineHeight: 1.08,
                  color: "#ffffff",
                  margin: "0 0 24px",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(90deg, rgb(199, 148, 255), rgb(255, 180, 213))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  100+ Brands.
                </span>
                <br />
                <span style={{ color: "#a5c9ff" }}>
                  Stories Engineered To Scale.
                </span>
              </motion.h1>

              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.98rem",
                  lineHeight: "1.85",
                  color: "rgba(255, 255, 255, 0.78)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  marginTop: "28px",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Belvo</strong> is an integrated digital marketing agency and creative studio headquartered in <strong>Goregaon, Mumbai</strong>. We partner with fast-scaling startups, direct-to-consumer pioneers, and established industry leaders to engineer brands that command attention and drive measurable growth.
                </p>
                <p style={{ margin: 0 }}>
                  Over the years, we have had the privilege of accelerating over <strong>100+ brands across 15+ industry verticals</strong>—from D2C skincare, high-fashion apparel, and gourmet culinary brands to fintech, edtech, and modern healthcare. Every brand partnership has reinforced our foundational principle: true growth happens when world-class creative intuition is reinforced by full-funnel performance data.
                </p>
                <p style={{ margin: 0 }}>
                  We deploy integrated capabilities under one unified roof: performance marketing with ruthless ROAS discipline, cinematic UGC and 3D visual production, organic social community building, influencer amplification, and modern web application development.
                </p>
                <p style={{ margin: 0, color: "#c794ff", fontWeight: 500 }}>
                  Behind every brief is a visionary founder who bet on an idea. Behind every project at Belvo is a relentless cross-functional collective committed to turning that vision into a market leader.
                </p>
              </motion.div>

              {/* 4 Core Pillars Snapshot */}
              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                style={{
                  marginTop: "32px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                }}
              >
                {[
                  { title: "Growth Marketing", desc: "Meta & Google Ads, ROAS optimization" },
                  { title: "Creative Production", desc: "3D Motion, UGC & commercial video" },
                  { title: "Brand Strategy & PR", desc: "Positioning & influencer networks" },
                  { title: "Web & Digital Tech", desc: "High-converting web applications" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c794ff", fontSize: "0.86rem", fontWeight: 700 }}>
                      <CheckCircle2 size={14} /> {item.title}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.55)", marginTop: "4px" }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Card: Stats & Verified Studio */}
            <motion.div
              ref={statsRef}
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              style={{
                background: "linear-gradient(145deg, rgba(20, 14, 30, 0.85), rgba(10, 8, 16, 0.95))",
                border: "1px solid rgba(130, 40, 200, 0.28)",
                borderRadius: "24px",
                padding: "clamp(20px, 3vw, 32px)",
                backdropFilter: "blur(16px)",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Metrics Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1px",
                  background: "rgba(130, 40, 200, 0.2)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(130, 40, 200, 0.3)",
                }}
              >
                {[
                  { label: "Client Brands", value: 100, suffix: "+" },
                  { label: "Client Dedication", value: 100, suffix: "%" },
                  { label: "Verticals Scaled", value: 15, suffix: "+" },
                  { label: "Mumbai HQ", value: 1, suffix: " Hub" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "rgba(13, 10, 22, 0.95)",
                      padding: "clamp(18px, 2.4vw, 24px)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "clamp(2rem, 4vw, 2.8rem)",
                        fontWeight: 900,
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: 1,
                      }}
                    >
                      <Counter from={0} to={stat.value} duration={2} suffix={stat.suffix} />
                    </div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(255, 255, 255, 0.6)",
                        marginTop: "8px",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Location Card (Brief Item 04) */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(123, 47, 190, 0.08)",
                  border: "1px solid rgba(123, 47, 190, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "rgba(123, 47, 190, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#c794ff",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.6 }}>
                      1st Floor, 271 Business Park, Model Industrial Estate,<br />
                      Near Virwani Industrial Estate, Off Western Express Highway,<br />
                      Vishveshwar Nagar, Goregaon East,<br />
                      Mumbai, Maharashtra 400063.
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid rgba(34, 197, 94, 0.35)",
                    color: "#4ade80",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Verified Office
                </div>
              </div>

              {/* Studio Workspace Photos (Brief Item 04) */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    Creative Space & Studio
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#c794ff" }}>
                    Goregaon Workspace
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {[
                    { id: "Office1", label: "Studio 1" },
                    { id: "Office2", label: "Studio 2" },
                    { id: "Office3", label: "Studio 3" },
                    { id: "Office4", label: "Studio 4" },
                    { id: "Office5", label: "Studio 5" },
                    { id: "Office6", label: "Studio 6" },
                  ].map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={statsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.45, delay: 0.3 + index * 0.1, ease: easeOut }}
                      style={{
                        position: "relative",
                        borderRadius: "14px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        aspectRatio: "16 / 10",
                      }}
                    >
                      <img
                        src={`/OfficeImages/${image.id}.${index < 3 ? "jpeg" : "jpg"}`}
                        alt={`Belvo Goregaon Studio ${index + 1}`}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.4s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.06)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="about-blue-content">
          <ExploreSection />
          <TeamSection />
          <BookACall />
          <FAQ />
        </div>
        <div style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
          <Footer />
        </div>
      </section>
    </>
  );
}
