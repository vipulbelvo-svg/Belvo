import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { getTeamMemberImage } from "@/lib/team-images";
import { useTeamStore, type TeamEntry, type TeamMemberEntry } from "@/lib/team-store";
import { fetchTeam, fetchDepartments, type TeamMember, type Department } from "@/lib/admin-api";

// Resolve a stored image_url to a usable src.
// Relative paths (e.g. "/uploads/member-xxx.jpg") work fine when the API
// runs on the same origin (Vercel). We only fall back to an explicit base
// when VITE_API_URL is explicitly set (e.g. a separate API host).
const EXPLICIT_API_BASE = import.meta.env.VITE_API_URL ?? "";

function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  // Relative path — prepend explicit base only if configured, otherwise
  // let the browser resolve it against the current origin.
  return EXPLICIT_API_BASE ? `${EXPLICIT_API_BASE}${url}` : url;
}

// Merge DB members into seed teams:
// - DB members whose name matches a seed member → carry over their imageUrl.
// - DB members not in seed (new interns) → add them to the right team.
function mergeDbIntoSeeds(
  seedTeams: TeamEntry[],
  dbMembers: TeamMember[],
  dbDepts: Department[],
): TeamEntry[] {
  // Build a lookup: team_id → DB members
  const byTeamId = new Map<string, TeamMember[]>();
  for (const m of dbMembers) {
    const arr = byTeamId.get(m.team_id) ?? [];
    arr.push(m);
    byTeamId.set(m.team_id, arr);
  }

  // For every seed team, patch imageUrl from DB where names match,
  // and append any DB members that are not yet in seed.
  const result: TeamEntry[] = seedTeams.map((seedTeam) => {
    const dbForTeam = byTeamId.get(seedTeam.id) ?? [];

    // Patch existing seed members with DB imageUrl
    const patchedMembers: TeamMemberEntry[] = seedTeam.members.map((sm) => {
      const match = dbForTeam.find(
        (dm) => dm.name.toLowerCase().trim() === sm.name.toLowerCase().trim()
      );
      if (match?.image_url) {
        return { ...sm, imageUrl: resolveImageUrl(match.image_url) };
      }
      return sm;
    });

    // Add new DB members not already in seed
    const seedNamesLower = new Set(seedTeam.members.map((m) => m.name.toLowerCase().trim()));
    const newMembers: TeamMemberEntry[] = dbForTeam
      .filter((dm) => !seedNamesLower.has(dm.name.toLowerCase().trim()))
      .map((dm) => ({
        id: String(dm.id),
        name: dm.name,
        imageUrl: resolveImageUrl(dm.image_url),
        responsibilities: dm.responsibilities?.length ? dm.responsibilities : undefined,
      }));

    return { ...seedTeam, members: [...patchedMembers, ...newMembers] };
  });

  // Add entirely new teams that exist in DB but not in seed
  const seedIds = new Set(seedTeams.map((t) => t.id));
  for (const dept of dbDepts) {
    if (seedIds.has(dept.id)) continue;
    const dbForTeam = byTeamId.get(dept.id) ?? [];
    if (!dbForTeam.length) continue;
    result.push({
      id: dept.id,
      name: dept.name,
      color: dept.color,
      lightColor: dept.light_color,
      members: dbForTeam.map((dm) => ({
        id: String(dm.id),
        name: dm.name,
        imageUrl: resolveImageUrl(dm.image_url),
        responsibilities: dm.responsibilities?.length ? dm.responsibilities : undefined,
      })),
    });
  }

  return result;
}

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
  // Local bundled photo takes priority; imageUrl has already been resolved
  // by mergeDbIntoSeeds so it's always an absolute-or-root-relative URL here.
  const img = getTeamMemberImage(name) || (imageUrl ?? undefined);

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
            key={member.name}
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
            key={member.name} name={member.name} team={team.name}
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

  const { teams: seedTeams } = useTeamStore();

  // Fetch live DB data and merge on top of seed teams so:
  //  - existing seed members get their DB-uploaded photo
  //  - new interns (DB-only) appear with their photo
  const [mergedTeams, setMergedTeams] = useState<TeamEntry[]>(seedTeams);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchTeam(), fetchDepartments()])
      .then(([dbMembers, dbDepts]) => {
        if (cancelled) return;
        setMergedTeams(mergeDbIntoSeeds(seedTeams, dbMembers, dbDepts));
      })
      .catch(() => {
        // API unavailable (local dev without server, etc.) — fall back to seed silently
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount; seedTeams is stable (from context)

  const adminTeam = mergedTeams.find((t) => t.id === "admin");
  const regularTeams = mergedTeams.filter((t) => t.id !== "admin");

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
