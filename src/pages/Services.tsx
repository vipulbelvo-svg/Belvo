import SEO from "@/components/SEO";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Sparkles, CheckCircle2, TrendingUp, Layers, Globe, Code, ArrowRight } from "lucide-react";
import { smoothScrollToElement } from "@/lib/smoothScroll";
import ServiceDialog from "@/components/ServiceDialog";
import { SERVICE_PACKAGES, SERVICE_PILLARS, type ServiceItem } from "@/content/services";
import Footer from "@/sections/Footer";
import BookACall from "@/sections/BookACall";
import Testimonials from "@/sections/Testimonials";
import { useTheme } from "@/contexts/ThemeContext";
import ServicesSection from "@/sections/ServicesSection";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function Services() {
  const { theme } = useTheme();
  const isIvory = theme === "ivory";
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const ctaRef = useRef(null);
  const packagesRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });
  const packagesInView = useInView(packagesRef, { once: true, margin: "-80px" });

  const getPillarIcon = (name: string) => {
    switch (name) {
      case "Growth & Performance":
        return <TrendingUp size={18} />;
      case "Creative Studio & Visuals":
        return <Sparkles size={18} />;
      case "Brand Strategy & PR":
        return <Globe size={18} />;
      case "Digital Products & Engineering":
        return <Code size={18} />;
      default:
        return <Layers size={18} />;
    }
  };

  return (
    <>
      <SEO
        title="Services — Performance Marketing, Creative Studio & Web Engineering | Belvo"
        description="Explore Belvo's 15 specialized digital agency services across Growth Marketing, Creative Production, Brand PR, and Web Engineering. Engineered to scale category leaders."
        path="/services"
      />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--belvo-bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          overflow: "hidden",
          padding: "clamp(60px, 8vw, 100px) 24px 40px",
          textAlign: "center",
        }}
      >
        {/* Ambient glows */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translate(-50%,-50%)", width: "80vw", height: "60vh", background: "radial-gradient(ellipse at center, rgba(123,47,190,0.25) 0%, transparent 65%)", filter: "blur(70px)" }} />
          <div style={{ position: "absolute", bottom: 0, left: "15%", width: "50vw", height: "40vh", background: "radial-gradient(ellipse at center, rgba(168,85,247,0.18) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", inset: "0", background: isIvory ? "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(248,245,239,0.85) 100%)" : "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(4,0,14,0.6) 100%)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "120px", background: isIvory ? "linear-gradient(to bottom, var(--belvo-bg), transparent)" : "linear-gradient(to bottom, rgba(4,0,14,0.9), transparent)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "140px", background: isIvory ? "linear-gradient(to top, var(--belvo-bg), transparent)" : "linear-gradient(to top, rgba(4,0,14,0.95), transparent)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "920px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} style={{ marginBottom: "20px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 18px",
                background: "rgba(123,47,190,0.16)",
                border: "1px solid rgba(123,47,190,0.35)",
                borderRadius: "100px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.74rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#c794ff",
              }}
            >
              <Sparkles size={13} />
              Full-Spectrum Agency Capabilities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.4rem, 6vw, 5.2rem)",
              lineHeight: 1.05,
              color: "var(--belvo-text-1)",
              margin: "0 0 18px",
              letterSpacing: "-0.02em",
            }}
          >
            Built for Scale.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #c794ff, #F45B96)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Engineered to Dominate.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
              lineHeight: 1.8,
              color: "var(--belvo-text-2)",
              margin: "0 auto 40px",
              maxWidth: "680px",
            }}
          >
            We unify 15 specialized capabilities across 4 core agency pillars — combining ruthless data-driven performance with world-class 3D visuals, brand positioning, and custom software engineering.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px" }}>
            <button
              onClick={() => smoothScrollToElement("services-grid")}
              data-testid="button-explore-services"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 34px",
                background: "linear-gradient(135deg, #7B2FBE, #a855f7)",
                border: "none",
                borderRadius: "10px",
                color: "#ffffff",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 8px 30px rgba(123, 47, 190, 0.45)",
                transition: "box-shadow 0.3s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Explore 15 Services <ArrowUpRight size={15} strokeWidth={2.5} />
            </button>

            <button
              onClick={() => smoothScrollToElement("service-packages")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "10px",
                color: "var(--belvo-text-1)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
            >
              View Packages & Retainers
            </button>
          </motion.div>
        </div>

        {/* 4 Pillars Overview Ribbon */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1200px",
            width: "100%",
            marginTop: "60px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "14px",
          }}
        >
          {SERVICE_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              style={{
                padding: "20px 22px",
                borderRadius: "16px",
                background: "rgba(20, 14, 30, 0.65)",
                border: "1px solid rgba(130, 40, 200, 0.22)",
                backdropFilter: "blur(12px)",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#c794ff", marginBottom: "8px" }}>
                {getPillarIcon(pillar.id)}
                <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#ffffff" }}>
                  {pillar.name}
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {pillar.tagline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES GRID / STICKY SCROLL SECTION ─────────────────── */}
      <ServicesSection id="services-grid" onServiceClick={setSelectedService} />

      {/* ── SERVICE PACKAGES & ENGAGEMENT MODELS (Brief Item 03) ──── */}
      <section
        id="service-packages"
        ref={packagesRef}
        style={{
          background: "#050308",
          padding: "clamp(80px, 10vw, 120px) 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 60px" }}>
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
                marginBottom: "16px",
              }}
            >
              Engagement Models & Packages
            </span>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                margin: "0 0 16px",
              }}
            >
              Structured for Velocity and High ROI
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(255, 255, 255, 0.65)", margin: 0 }}>
              Whether you need an end-to-end growth retainer or a focused creative sprint, we structure transparent, deliverable-driven engagements aligned with leadership goals.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {SERVICE_PACKAGES.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                custom={idx}
                variants={fadeUp}
                initial="hidden"
                animate={packagesInView ? "visible" : "hidden"}
                style={{
                  background: pkg.badge
                    ? "linear-gradient(145deg, rgba(30, 18, 50, 0.9), rgba(15, 10, 26, 0.95))"
                    : "rgba(18, 14, 26, 0.75)",
                  border: pkg.badge
                    ? "1px solid rgba(199, 148, 255, 0.45)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  boxShadow: pkg.badge ? "0 20px 50px rgba(123, 47, 190, 0.25)" : "none",
                }}
              >
                {pkg.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "24px",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, #7B2FBE, #F45B96)",
                      color: "#ffffff",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {pkg.badge}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#c794ff", letterSpacing: "0.08em", marginBottom: "8px" }}>
                    {pkg.pillar}
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#ffffff", margin: "0 0 10px", lineHeight: 1.25 }}>
                    {pkg.name}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.6, margin: "0 0 20px" }}>
                    {pkg.summary}
                  </p>

                  <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "18px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255, 255, 255, 0.5)", marginBottom: "12px" }}>
                      Scope Includes:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {pkg.deliverables.map((item, dIdx) => (
                        <div key={dIdx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.85)" }}>
                          <CheckCircle2 size={15} color="#c794ff" style={{ marginTop: "2px", flexShrink: 0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.76rem", color: "rgba(255, 255, 255, 0.5)", marginBottom: "16px" }}>
                    <strong style={{ color: "#ffffff" }}>Timeline:</strong> {pkg.timeline}
                  </div>
                  <button
                    onClick={() => smoothScrollToElement("book-call")}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      background: pkg.badge ? "linear-gradient(135deg, #7B2FBE, #a855f7)" : "rgba(255, 255, 255, 0.08)",
                      border: pkg.badge ? "none" : "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                  >
                    Request Scope & Proposal <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section
        ref={ctaRef}
        style={{ background: "var(--belvo-bg)", padding: "0 24px 120px", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "70vw", height: "400px", background: "radial-gradient(ellipse at center, rgba(123,47,190,0.18) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            background: "rgba(18, 14, 26, 0.8)",
            border: "1px solid rgba(130, 40, 200, 0.3)",
            borderRadius: "20px",
            padding: "clamp(36px, 5vw, 60px)",
            backdropFilter: "blur(16px)",
          }}
        >
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", lineHeight: 1.15, color: "#ffffff", margin: "0 0 14px" }}>
            Ready to Accelerate Your <span style={{ color: "#c794ff" }}>Brand?</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", lineHeight: 1.75, color: "rgba(255, 255, 255, 0.7)", margin: "0 auto 32px", maxWidth: "520px" }}>
            Schedule an exploratory strategy consultation with our agency leads in Goregaon, Mumbai. We will map a customized roadmap tailored to your specific business objectives.
          </p>
          <button
            onClick={() => smoothScrollToElement("book-call")}
            data-testid="button-services-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 40px",
              background: "linear-gradient(135deg, #7B2FBE, #a855f7)",
              border: "none",
              borderRadius: "10px",
              color: "#ffffff",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(123, 47, 190, 0.45)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Book a Strategy Call <ArrowUpRight size={15} strokeWidth={2.5} />
          </button>
        </motion.div>
      </section>

      <BookACall />
      <ServiceDialog service={selectedService} onClose={() => setSelectedService(null)} />
      <Footer />
    </>
  );
}
