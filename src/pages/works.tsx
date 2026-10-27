import SEO from "@/components/SEO";
import PortfolioSection from "@/sections/PortfolioSection";
import IntegrationsSection from "@/sections/IntegrationsSection";
import Footer from "@/sections/Footer";
import BookACall from "@/sections/BookACall";
import { caseStudies } from "@/content/case-studies";
import { motion } from "framer-motion";
import { ArrowUpRight, Download, FileText, Sparkles, Building2 } from "lucide-react";

export default function Works() {
  return (
    <>
      <SEO
        title="Portfolio & Case Studies — 100+ Brands Scaled | Belvo"
        description="Explore Belvo's verified client portfolio and in-depth case studies across 15+ industries. Real brands, real growth systems, and performance data from our Mumbai agency."
        path="/works"
      />

      {/* ── HERO BANNER ────────────────────────────────────────── */}
      <section
        style={{
          background: "#050308",
          padding: "clamp(80px, 10vw, 120px) 24px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)", width: "70vw", height: "50vh", background: "radial-gradient(ellipse at center, rgba(123,47,190,0.2) 0%, transparent 65%)", filter: "blur(80px)" }} />
        </div>

        <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative", zIndex: 1 }}>
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
            Verified Case Studies & Client Roster
          </span>

          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)",
              lineHeight: 1.08,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: "0 0 18px",
            }}
          >
            100+ Brands.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #c794ff, #F45B96)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Measurable Enterprise Impact.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
              lineHeight: 1.8,
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: "640px",
              margin: "0 auto 36px",
            }}
          >
            Explore our deep-dive case studies and verified industry brand roster across skincare, fashion, hospitality, consumer tech, and finance.
          </p>
        </div>
      </section>

      {/* ── FEATURED CASE STUDIES GRID ──────────────────────────── */}
      <section
        style={{
          background: "#08060e",
          padding: "20px 24px 80px",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                Featured Deep-Dive Case Studies
              </h2>
              <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.55)", margin: "4px 0 0" }}>
                Documented execution frameworks, campaigns, and ROI results.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {caseStudies.slice(0, 8).map((cs) => (
              <motion.div
                key={cs.slug}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "rgba(18, 14, 26, 0.8)",
                  border: "1px solid rgba(130, 40, 200, 0.2)",
                  borderRadius: "18px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden", background: "#120e1a" }}>
                    <img
                      src={cs.cover}
                      alt={cs.title}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "20px" }}>
                    <div style={{ fontSize: "0.72rem", color: "#c794ff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      {cs.focus}
                    </div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: "0 0 8px" }}>
                      {cs.title}
                    </h3>
                    <p style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "rgba(255, 255, 255, 0.65)", margin: 0 }}>
                      {cs.excerpt}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "0 20px 20px" }}>
                  <a
                    href={cs.pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#c794ff",
                      textDecoration: "none",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      background: "rgba(123, 47, 190, 0.12)",
                      border: "1px solid rgba(123, 47, 190, 0.3)",
                      transition: "background 0.2s",
                    }}
                  >
                    <FileText size={14} /> View Case Study PDF <ArrowUpRight size={13} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 100+ BRANDS BY VERTICAL ─────────────────────────────── */}
      <PortfolioSection id="portfolio" />
      <IntegrationsSection />
      <BookACall />
      <Footer />
    </>
  );
}
