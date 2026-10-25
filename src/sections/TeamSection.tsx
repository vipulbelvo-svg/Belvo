import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { getTeamMemberImage } from "@/lib/team-images";
import { useTeamStore, type TeamEntry } from "@/lib/team-store";

const easeSmooth = [0.22, 1, 0.36, 1] as const;
void easeSmooth; // referenced for future transitions

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const fadeUp = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.05, ease: "easeOut" as const },
  }),
};

function MemberCard({
  name, team, color, lightColor, responsibilities, inView, index, imageUrl,
}: {
  name: string; team: string; color: string; lightColor: string;
  responsibilities?: readonly string[]; inView: boolean; index: number;
  imageUrl?: string | null;
}) {
  const initials = getInitials(name);
  // Uploaded photo takes top priority; bundled asset photo is fallback only.
  const img = (imageUrl && imageUrl.trim()) ? imageUrl : getTeamMemberImage(name);

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "28px 20px 24px",
        background: "var(--belvo-bg-card)",
        border: "1px solid var(--belvo-border-card)",
        borderRadius: "18px",
        cursor: "default", position: "relative", overflow: "hidden",
        backdropFilter: "blur(14px)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 80, height: 40,
        background: `radial-gradient(ellipse at center, ${color}25, transparent 70%)`,
        filter: "blur(12px)", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{
          width: 84, height: 84, borderRadius: "50%",
          background: img ? "none" : `linear-gradient(135deg, ${color}cc, ${lightColor}88)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2px solid ${color}44`,
          boxShadow: `0 0 28px ${color}22`,
          position: "relative", overflow: "hidden",
        }}>
          {img ? (
            <img src={img} alt={name} loading="lazy" style={{
              width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%",
              objectPosition: name === "Mohammad Anasuddin Zaid" ? "50% 30%" : "50% 50%",
            }} />
          ) : (
            <>
              <div style={{ position: "absolute", inset: 4, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "#fff", letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}>{initials}</span>
            </>
          )}
        </div>
        <div style={{
          position: "absolute", bottom: 4, right: 4,
          width: 14, height: 14, borderRadius: "50%",
          background: `linear-gradient(135deg, ${color}, ${lightColor})`,
          border: "2.5px solid var(--belvo-bg)",
          boxShadow: `0 0 10px ${color}80`,
        }} />
      </div>

      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--belvo-text-1)", textAlign: "center", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 6 }}>
        {name}
      </span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: lightColor, marginBottom: responsibilities ? 14 : 0 }}>
        {team}
      </span>

      {responsibilities && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 4 }}>
          {responsibilities.map((r) => (
            <span key={r} style={{
              fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--belvo-text-2)",
              background: "var(--belvo-bg-card-2)",
              border: "1px solid var(--belvo-border-card)",
              borderRadius: "100px", padding: "3px 10px",
            }}>{r}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function AdminGroup({ adminTeam }: { adminTeam?: TeamEntry }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (!adminTeam) return null;

  return (
    <div ref={ref} style={{ marginBottom: "64px", width: "100%" }}>
      <motion.div
        custom={0} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{ display: "flex", alignItems: "center", marginBottom: 40, marginTop: 16 }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--belvo-border-card)" }} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", fontWeight: 600,
          letterSpacing: "0.22em", textTransform: "uppercase", color: "#007BFF",
          background: "rgba(0, 123, 255, 0.1)", border: "0.5px solid rgba(0, 123, 255, 0.3)",
          borderRadius: "100px", padding: "5px 16px", margin: "0 16px",
        }}>
          ADMINISTRATION
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--belvo-border-card)" }} />
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 240px))", gap: 16 }}>
        {adminTeam.members.map((member, i) => (
          <MemberCard
            key={member.id || member.name}
            name={member.name}
            team={member.role ?? adminTeam.name}
            color={adminTeam.color}
            lightColor={adminTeam.lightColor}
            responsibilities={member.responsibilities ?? adminTeam.responsibilities}
            imageUrl={member.imageUrl}
            inView={inView}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

function TeamGroup({ team }: { team: TeamEntry }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} style={{ marginBottom: "64px", width: "100%" }}>
      <motion.div
        custom={0} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"}
        style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}
      >
        <div style={{ width: 3, height: 22, background: `linear-gradient(180deg, ${team.color}, transparent)`, borderRadius: 2, flexShrink: 0 }} />
        <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "clamp(0.95rem, 2vw, 1.15rem)", color: "var(--belvo-text-1)", margin: 0, letterSpacing: "-0.01em" }}>
          {team.name}
        </h3>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${team.color}28, transparent)` }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--belvo-text-4)" }}>
          {team.members.length} {team.members.length <= 1 ? "member" : "members"}
        </span>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
        {team.members.map((member, i) => (
          <MemberCard
            key={member.id || member.name} name={member.name} team={member.role?.trim() || team.name}
            color={team.color} lightColor={team.lightColor}
            responsibilities={member.responsibilities}
            imageUrl={member.imageUrl}
            inView={inView} index={i + 1}
          />
        ))}
      </div>
    </div>
  );
}

export default function TeamSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const { teams } = useTeamStore();

  const adminTeam = teams.find((t) => t.id === "admin");
  const regularTeams = teams.filter((t) => t.id !== "admin");

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .belvo-ceo-inner {
            flex-direction: column !important;
            text-align: center !important;
            padding: 36px 28px !important;
            gap: 28px !important;
          }
        }
      `}</style>

      <section
        id="team"
        style={{
          background: "var(--belvo-bg)",
          position: "relative",
          overflow: "hidden",
          padding: "100px 24px 120px",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, var(--belvo-border-divider), transparent)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "70vw", height: 400,
          background: "radial-gradient(ellipse at center, var(--belvo-glow-blob) 0%, transparent 65%)",
          filter: "blur(70px)", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div ref={headerRef} style={{ textAlign: "center", marginBottom: "80px" }}>
            <motion.span
              custom={0} variants={fadeUp} initial="hidden" animate={headerInView ? "visible" : "hidden"}
              style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "#0b3b9c", marginBottom: 14 }}
            >
              Our Team
            </motion.span>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.8rem)", lineHeight: 1.05, color: "var(--belvo-text-1)", margin: "0 0 16px", letterSpacing: "-0.01em" }}
            >
              The BELVO <span style={{ color: "#0b3b9c" }}>Collective</span>
            </motion.h2>

            <motion.p
              custom={2} variants={fadeUp} initial="hidden" animate={headerInView ? "visible" : "hidden"}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", lineHeight: 1.75, color: "var(--belvo-text-3)", maxWidth: 520, margin: "0 auto", letterSpacing: "0.01em" }}
            >
              Meet the talented people building exceptional digital experiences together.
            </motion.p>
          </div>

          {regularTeams.map((team) => (
            <TeamGroup key={team.id} team={team} />
          ))}

          <AdminGroup adminTeam={adminTeam} />
        </div>
      </section>
    </>
  );
}
