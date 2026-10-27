/**
 * team-store.ts
 * Reactive team data store with automatic MongoDB Atlas cloud synchronization.
 * Synchronizes additions, edits, and deletions across all devices in real-time,
 * while maintaining local cache for instant offline rendering.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  fetchTeam,
  fetchTeamData,
  createMember,
  updateMember as apiUpdateMember,
  deleteMember as apiDeleteMember,
  fetchDepartments,
  createDepartment as apiCreateDepartment,
  updateDepartment as apiUpdateDepartment,
  deleteDepartment as apiDeleteDepartment,
  type TeamMember,
  type Department,
} from "./admin-api";

// ── Types ─────────────────────────────────────────────

export interface TeamMemberEntry {
  /** Unique within the team / MongoDB ID */
  id: string;
  name: string;
  /** Data-URL (for newly uploaded photos), hosted URL, or null */
  imageUrl?: string | null;
  responsibilities?: string[];
  role?: string;
  isCustom?: boolean;
}

export interface TeamEntry {
  id: string;
  name: string;
  color: string;
  lightColor: string;
  members: TeamMemberEntry[];
  responsibilities?: string[];
}

// ── Seed data ─────────────────────────────────────────

function makeMember(name: string, extra: Partial<TeamMemberEntry> = {}): TeamMemberEntry {
  return { id: name.toLowerCase().replace(/\s+/g, "-"), name, ...extra };
}

export const SEED_TEAMS: TeamEntry[] = [
  {
    id: "founder-and-ceo",
    name: "Founder and CEO",
    color: "#dc2626",
    lightColor: "#f87171",
    members: [
      makeMember("Hrishikesh Mishra", {
        role: "Founder / CEO",
      }),
    ],
  },
  {
    id: "admin",
    name: "Administration",
    color: "#007BFF",
    lightColor: "#0056b3",
    responsibilities: ["Operations", "Team Coordination", "Client Communication", "Internal Management"],
    members: [
      makeMember("Mohd Usaid Ali Khan"),
      makeMember("Raavula Vaibhav"),
      makeMember("Achintya Gurba", {
        role: "Operational Manager",
        responsibilities: ["Daily Operations", "Process Improvement", "Team Coordination", "Quality Assurance"],
      }),
      makeMember("Chetan Pawar", {
        role: "Operational Manager",
        responsibilities: ["Daily Operations", "Process Improvement", "Team Coordination", "Quality Assurance"],
      }),
      makeMember("Vivek Khalia", {
        role: "Founder Associate",
        responsibilities: ["Strategic Execution", "Process Optimization", "Partnership Development", "Performance Tracking"],
      }),
      makeMember("Mamindla Mayuri", {
        role: "Team manager",
      }),
      makeMember("Pranitha sai", {
        role: "CBDO",
      }),
      makeMember("Vedant Chautiwar"),
    ],
  },
  {
    id: "hr",
    name: "HR",
    color: "#d97706",
    lightColor: "#f59e0b",
    members: [
      makeMember("Kasetty lavanya", { role: "HR" }),
      makeMember("Sheth yamani", { role: "HR" }),
      makeMember("Rachana reddy", { role: "HR" }),
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("hema harshitha", { role: "brand outreach and pr team" }),
      makeMember("Gunjan Umate", { role: "Marketing and outreach intern" }),
      makeMember("Ramya pathak", { role: "Marketing associate" }),
      makeMember("Balaka Rasmita Reddy", { role: "Digital marketing" }),
      makeMember("Arti punia", { role: "brand outreach and PR team" }),
      makeMember("Smahi Jhang", { role: "Product design" }),
    ],
  },
  {
    id: "web",
    name: "Web Development",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Aaryan Bansal", { role: "Full Stack Developer" }),
      makeMember("Bhavishya Pasupula", { role: "Full Stack Developer" }),
      makeMember("Gokavarapu Yashwanth"),
      makeMember("Gudishetty manasvini", { role: "Frontend developer" }),
      makeMember("Harsh mayank"),
      makeMember("Ishwari", { role: "Web developer" }),
      makeMember("JM Navanthiga", { role: "Backend Developer" }),
      makeMember("Jabez Jesudason", { role: "Web Development Intern" }),
      makeMember("Kolipaka abhichandra"),
      makeMember("Kolluru hari chandra sekhar", { role: "web developer" }),
      makeMember("Kuchartlapati hansika", { role: "Full Stack Developer" }),
      makeMember("Mohd Affan siddiqui", { role: "Frontend developer" }),
      makeMember("Neha Gaikwad", { role: "Web developer" }),
      makeMember("Nimish Garrg", { role: "Frontend developer" }),
      makeMember("Sai pranav attaluri", { role: "Full Stack Developer" }),
      makeMember("Sourab reddy", { role: "Web developer" }),
      makeMember("Surya panav", { role: "Frontend developer" }),
      makeMember("Tamil Selvan"),
      makeMember("Vivek Kumar Yadav", { role: "Full Stack Developer" }),
      makeMember("Yashwanth polepalli", { role: "web Developer" }),
      makeMember("Lokesh"),
      makeMember("Sri Satya"),
      makeMember("Akhil"),
      makeMember("Mohammad Anasuddin Zaid"),
      makeMember("Sandali"),
      makeMember("Ram Nath G K"),
      makeMember("Guru dutt"),
      makeMember("Shailender"),
      makeMember("Aditya Sarkar"),
      makeMember("Divyansh Salanki"),
      makeMember("Harshitha"),
      makeMember("Chirag Arora"),
      makeMember("Prathamesh Kharbal"),
      makeMember("Himagiri Siddesh"),
      makeMember("Varsha"),
      makeMember("Anuj Kumar"),
      makeMember("Anshul Nautiyal"),
    ],
  },
  {
    id: "app",
    name: "App Development",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Anshika Srivastava", { role: "App developer" }),
      makeMember("Lakshya jaiswal", { role: "Android Developer" }),
      makeMember("Anand"),
      makeMember("Aaryan"),
      makeMember("Suhani"),
      makeMember("Aman"),
      makeMember("Naveen Kumar"),
      makeMember("Sushmitha"),
      makeMember("Sinchana"),
      makeMember("Hari Chandra Sekhar"),
      makeMember("Dasari Ganesh"),
    ],
  },
  {
    id: "cyber",
    name: "Cyber Security",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Aaryan Bansal"),
      makeMember("Himagiri siddesh M"),
      makeMember("Vishali Karee", { role: "cyber security" }),
      makeMember("Harsh"),
      makeMember("Sourav"),
      makeMember("Parv"),
      makeMember("Ankit Sharma"),
    ],
  },
  {
    id: "software",
    name: "Software Development",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Budige Ashwini", { role: "Software Developer" }),
      makeMember("Charan jannarapu", { role: "Software developer" }),
      makeMember("Joanna Frankincense", { role: "Software Developer" }),
      makeMember("Mahammad imran", { role: "Software developer" }),
      makeMember("Narsannagari nandeeshwar reddy", { role: "Software developer" }),
      makeMember("Parthib basu", { role: "Principal engineer" }),
      makeMember("Rampally lalish", { role: "Software developer" }),
      makeMember("Shakti Prasad Muduli", { role: "Penetration engineer" }),
      makeMember("Vedant Malwar", { role: "Software Developer" }),
      makeMember("Aditya Siras"),
      makeMember("Rudra Matta"),
      makeMember("Ankush Gemnnani"),
      makeMember("Aditya Singh"),
      makeMember("Aryan"),
      makeMember("Neha Gaikwad"),
      makeMember("Vivek Kumar"),
    ],
  },
  {
    id: "analytics",
    name: "Business & Data Analytics",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Akkireddy sai amar chaitanya"),
      makeMember("Andhavarapu Rohit", { role: "Data Analyst" }),
      makeMember("Arikatla Naga Jyothi", { role: "Product Analyst" }),
      makeMember("Bhuvanasri"),
      makeMember("Chinnadamera Snehavarsha", { role: "Data Analyst" }),
      makeMember("Dhaskhaya Balaraman", { role: "Data Analyst" }),
      makeMember("Hansika pallikonda", { role: "Data engineer" }),
      makeMember("J.Japesh Reddy"),
      makeMember("Manasvi Singh pundir", { role: "Business Analyst" }),
      makeMember("Mohammad anasuddin zaid", { role: "Business analyst" }),
      makeMember("Pari singal", { role: "Data Analyst" }),
      makeMember("Santhosh thummalagunta", { role: "data analyst" }),
      makeMember("Shaik afshan", { role: "Data analyst" }),
      makeMember("Sravani juturu", { role: "Data Analyst" }),
      makeMember("Supriya"),
      makeMember("Ishika"),
      makeMember("Obed"),
      makeMember("Sasikumar"),
      makeMember("Sharfudeen"),
      makeMember("Sibijan"),
      makeMember("Tejaswini"),
      makeMember("Sujeet Kumar"),
    ],
  },
  {
    id: "graphic",
    name: "Graphic Designing",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Patnayukuni Vinod", { role: "UI/UX Designer" }),
      makeMember("Shruti kumari", { role: "UI/UX desinger" }),
      makeMember("Anurag khushwaha"),
      makeMember("Rimi ghosh"),
      makeMember("Sanskruti akare"),
      makeMember("Deepak Sharma"),
      makeMember("Neha"),
      makeMember("Yash"),
      makeMember("Shaik Nihayath"),
    ],
  },
  {
    id: "social",
    name: "Social Media Management",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Saipriya Bhowmik", { role: "Social media intern" }),
      makeMember("Yash Mewati"),
      makeMember("Anisha Verma"),
    ],
  },
  {
    id: "content",
    name: "Content Writer",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Sheth Yamani"),
    ],
  },
  {
    id: "cinematography",
    name: "Cinematography",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Asht vinayak", { role: "Video editor" }),
      makeMember("Adarsh"),
    ],
  },
  {
    id: "full-stack",
    name: "Full Stack",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Aaryan Bansal", { role: "Full stack Developer" }),
      makeMember("Bhavishya Pasupula", { role: "Full stack developer" }),
      makeMember("Kuchartlapati hansika"),
      makeMember("Rishwanth sv", { role: "Full stack developer" }),
      makeMember("Sai pranav attaluri", { role: "Full stack developer" }),
      makeMember("Vivek Kumar Yadav", { role: "Full Stack Developer" }),
    ],
  },
  {
    id: "aiml",
    name: "AIML",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      makeMember("Atchyuta Pavan Karthikeya", { role: "AIML Engineer" }),
      makeMember("Chayan Banga", { role: "AIML engineer" }),
      makeMember("Gunda sathvik", { role: "Robotics" }),
      makeMember("Pippera thrija", { role: "AIML engineer" }),
      makeMember("Ravi Vinayak", { role: "AIML engineer" }),
      makeMember("Saggam Niheetha", { role: "AIML Engineer" }),
    ],
  },
];

// ── Image resolution helper ───────────────────────────

const EXPLICIT_API_BASE = import.meta.env.VITE_API_URL ?? "";

function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return EXPLICIT_API_BASE ? `${EXPLICIT_API_BASE}${url}` : url;
}

// ── Cloud merge helper ────────────────────────────────

export function mergeTeamsWithCloud(
  baseTeams: TeamEntry[],
  dbMembers: TeamMember[],
  dbDepts: Department[],
  deletedIds: Set<string> = new Set(),
  deletedNames: Set<string> = new Set()
): TeamEntry[] {
  const byTeamId = new Map<string, TeamMember[]>();
  for (const m of dbMembers) {
    const tid = m.team_id || "web";
    const arr = byTeamId.get(tid) ?? [];
    arr.push(m);
    byTeamId.set(tid, arr);
  }

  const deptMap = new Map<string, Department>();
  for (const d of dbDepts) {
    deptMap.set(d.id, d);
  }

  const matchedDbIds = new Set<string>();

  const result: TeamEntry[] = baseTeams.map((seedTeam) => {
    const dbDept = deptMap.get(seedTeam.id);
    const dbForTeam = byTeamId.get(seedTeam.id) ?? [];

    const existingNames = new Set<string>();

    // 1. Filter out deleted seed members, then patch with any DB updates
    const patchedMembers: TeamMemberEntry[] = seedTeam.members
      .filter((sm) => {
        const idMatch = deletedIds.has(String(sm.id));
        const nameMatch = deletedNames.has(sm.name.toLowerCase().trim());
        return !idMatch && !nameMatch;
      })
      .map((sm) => {
        existingNames.add(sm.name.toLowerCase().trim());
        const match = dbForTeam.find(
          (dm) =>
            String(dm.id) === String(sm.id) ||
            dm.name.toLowerCase().trim() === sm.name.toLowerCase().trim()
        );
        if (match) {
          matchedDbIds.add(String(match.id));
          return {
            ...sm,
            id: String(match.id),
            name: match.name || sm.name,
            role: match.role !== undefined ? match.role : sm.role,
            imageUrl: resolveImageUrl(match.image_url) ?? sm.imageUrl,
            responsibilities: match.responsibilities?.length ? match.responsibilities : sm.responsibilities,
          };
        }
        return sm;
      });

    // 2. Add custom members for this team, ensuring no duplicate names or resurrected deleted members
    const newMembers: TeamMemberEntry[] = [];
    for (const dm of dbForTeam) {
      const idStr = String(dm.id);
      const normName = dm.name.toLowerCase().trim();
      if (
        matchedDbIds.has(idStr) ||
        existingNames.has(normName) ||
        deletedIds.has(idStr) ||
        deletedNames.has(normName)
      ) {
        continue;
      }
      matchedDbIds.add(idStr);
      existingNames.add(normName);
      newMembers.push({
        id: idStr,
        name: dm.name,
        role: dm.role,
        imageUrl: resolveImageUrl(dm.image_url),
        responsibilities: dm.responsibilities?.length ? dm.responsibilities : undefined,
        isCustom: true,
      });
    }

    return {
      ...seedTeam,
      name: dbDept?.name || seedTeam.name,
      color: dbDept?.color || seedTeam.color,
      lightColor: dbDept?.light_color || seedTeam.lightColor,
      members: [...patchedMembers, ...newMembers],
    };
  });

  // Append any departments created in DB that aren't in base
  const existingTeamIds = new Set(result.map((t) => t.id));
  for (const d of dbDepts) {
    if (!existingTeamIds.has(d.id)) {
      const dbForTeam = byTeamId.get(d.id) ?? [];
      const teamExistingNames = new Set<string>();
      const members: TeamMemberEntry[] = [];

      for (const dm of dbForTeam) {
        const idStr = String(dm.id);
        const normName = dm.name.toLowerCase().trim();
        if (
          matchedDbIds.has(idStr) ||
          teamExistingNames.has(normName) ||
          deletedIds.has(idStr) ||
          deletedNames.has(normName)
        ) {
          continue;
        }
        matchedDbIds.add(idStr);
        teamExistingNames.add(normName);
        members.push({
          id: idStr,
          name: dm.name,
          role: dm.role,
          imageUrl: resolveImageUrl(dm.image_url),
          responsibilities: dm.responsibilities?.length ? dm.responsibilities : undefined,
          isCustom: true,
        });
      }

      result.push({
        id: d.id,
        name: d.name,
        color: d.color,
        lightColor: d.light_color,
        members,
      });
      existingTeamIds.add(d.id);
    }
  }

  // Also catch any DB members whose team_id was created dynamically without a dept record
  for (const [tid, members] of byTeamId.entries()) {
    if (!existingTeamIds.has(tid)) {
      const teamExistingNames = new Set<string>();
      const teamMembers: TeamMemberEntry[] = [];

      for (const dm of members) {
        const idStr = String(dm.id);
        const normName = dm.name.toLowerCase().trim();
        if (
          matchedDbIds.has(idStr) ||
          teamExistingNames.has(normName) ||
          deletedIds.has(idStr) ||
          deletedNames.has(normName)
        ) {
          continue;
        }
        matchedDbIds.add(idStr);
        teamExistingNames.add(normName);
        teamMembers.push({
          id: idStr,
          name: dm.name,
          role: dm.role,
          imageUrl: resolveImageUrl(dm.image_url),
          responsibilities: dm.responsibilities?.length ? dm.responsibilities : undefined,
          isCustom: true,
        });
      }

      result.push({
        id: tid,
        name: members[0]?.team_name || tid,
        color: "#0b3b9c",
        lightColor: "#5ba9e6",
        members: teamMembers,
      });
      existingTeamIds.add(tid);
    }
  }

  const baseOrderMap = new Map(baseTeams.map((t, idx) => [t.id, idx]));
  result.sort((a, b) => {
    const orderA = deptMap.get(a.id)?.sort_order ?? (baseOrderMap.has(a.id) ? baseOrderMap.get(a.id)! + 1 : 999);
    const orderB = deptMap.get(b.id)?.sort_order ?? (baseOrderMap.has(b.id) ? baseOrderMap.get(b.id)! + 1 : 999);
    return orderA - orderB;
  });

  return result;
}

// ── Persistence ───────────────────────────────────────

const STORAGE_KEY = "belvo_teams_v3";
const DELETED_KEY = "belvo_deleted_members_v3";

function loadDeleted(): { ids: string[]; names: string[] } {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (!raw) return { ids: [], names: [] };
    const parsed = JSON.parse(raw);
    return {
      ids: Array.isArray(parsed?.ids) ? parsed.ids : [],
      names: Array.isArray(parsed?.names) ? parsed.names : [],
    };
  } catch {
    return { ids: [], names: [] };
  }
}

function recordDeleted(id?: string, name?: string) {
  try {
    const cur = loadDeleted();
    if (id && !cur.ids.includes(String(id))) cur.ids.push(String(id));
    if (name) {
      const norm = name.toLowerCase().trim();
      if (!cur.names.includes(norm)) cur.names.push(norm);
    }
    localStorage.setItem(DELETED_KEY, JSON.stringify(cur));
  } catch {}
}

function clearDeleted(name?: string, id?: string) {
  try {
    const cur = loadDeleted();
    if (name) {
      const norm = name.toLowerCase().trim();
      cur.names = cur.names.filter((n) => n !== norm);
    }
    if (id) {
      cur.ids = cur.ids.filter((i) => i !== String(id));
    }
    localStorage.setItem(DELETED_KEY, JSON.stringify(cur));
  } catch {}
}

function loadTeams(): TeamEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_TEAMS;
    const parsed = JSON.parse(raw) as TeamEntry[];
    const orderMap = new Map(SEED_TEAMS.map((st, i) => [st.id, i]));
    return parsed
      .map((t) => ({
        ...t,
        members: t.members.map((m) => ({
          ...m,
          id: m.id || m.name.toLowerCase().replace(/\s+/g, "-"),
        })),
      }))
      .sort((a, b) => {
        const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
        const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
        return idxA - idxB;
      });
  } catch {
    return SEED_TEAMS;
  }
}

function saveTeams(teams: TeamEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  } catch {
    // quota exceeded — silently ignore
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Context ───────────────────────────────────────────

interface TeamStore {
  teams: TeamEntry[];
  isSyncing: boolean;

  // Department CRUD
  addTeam(team: Omit<TeamEntry, "members">): Promise<void>;
  updateTeam(id: string, patch: Partial<Omit<TeamEntry, "id" | "members">>): Promise<void>;
  removeTeam(id: string): Promise<void>;

  // Member CRUD
  addMember(teamId: string, member: Omit<TeamMemberEntry, "id">): Promise<void>;
  updateMember(teamId: string, memberId: string, patch: Partial<Omit<TeamMemberEntry, "id">>): Promise<void>;
  removeMember(teamId: string, memberId: string): Promise<void>;

  // Refresh from cloud
  refreshTeams(): Promise<void>;

  // Reset
  resetToDefaults(): void;
}

const TeamContext = createContext<TeamStore | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<TeamEntry[]>(loadTeams);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const commit = useCallback((next: TeamEntry[]) => {
    setTeams(next);
    saveTeams(next);
  }, []);

  // Sync with cloud on mount, on focus, and on schedule
  const syncWithCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [teamData, dbDepts] = await Promise.all([
        fetchTeamData().catch(() => ({ members: [] as TeamMember[], deletedIds: [] as string[], deletedNames: [] as string[] })),
        fetchDepartments().catch(() => [] as Department[]),
      ]);

      if (teamData.members.length === 0 && dbDepts.length === 0) {
        console.warn("Cloud sync returned empty data; retaining current teams.");
        return;
      }

      const localDeleted = loadDeleted();
      const allDeletedIds = new Set([...localDeleted.ids, ...(teamData.deletedIds || [])]);
      const allDeletedNames = new Set([
        ...localDeleted.names,
        ...(teamData.deletedNames || []).map((n) => n.toLowerCase().trim()),
      ]);

      const merged = mergeTeamsWithCloud(
        SEED_TEAMS,
        teamData.members,
        dbDepts,
        allDeletedIds,
        allDeletedNames
      );
      setTeams(merged);
      saveTeams(merged);
    } catch (err) {
      console.warn("Could not sync teams with cloud:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncWithCloud();

    const onFocus = () => {
      syncWithCloud();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);
    const interval = setInterval(syncWithCloud, 25000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
      clearInterval(interval);
    };
  }, [syncWithCloud]);

  const addTeam = useCallback(async (team: Omit<TeamEntry, "members">) => {
    commit([...teams, { ...team, members: [] }]);
    try {
      await apiCreateDepartment({
        id: team.id,
        name: team.name,
        color: team.color,
        lightColor: team.lightColor,
      });
    } catch (err) {
      console.warn("Failed to create department in cloud:", err);
    }
  }, [teams, commit]);

  const updateTeam = useCallback(async (id: string, patch: Partial<Omit<TeamEntry, "id" | "members">>) => {
    commit(teams.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      await apiUpdateDepartment(id, {
        name: patch.name,
        color: patch.color,
        lightColor: patch.lightColor,
      });
    } catch (err) {
      console.warn("Failed to update department in cloud:", err);
    }
  }, [teams, commit]);

  const removeTeam = useCallback(async (id: string) => {
    commit(teams.filter((t) => t.id !== id));
    try {
      await apiDeleteDepartment(id);
    } catch (err) {
      console.warn("Failed to delete department in cloud:", err);
    }
  }, [teams, commit]);

  const addMember = useCallback(async (teamId: string, member: Omit<TeamMemberEntry, "id">) => {
    clearDeleted(member.name);
    const tempId = `temp-${uid()}`;
    const newMember: TeamMemberEntry = { ...member, id: tempId, isCustom: true };
    setTeams((prev) => {
      const next = prev.map((t) =>
        t.id === teamId ? { ...t, members: [...t.members, newMember] } : t
      );
      saveTeams(next);
      return next;
    });

    try {
      const dept = teams.find((t) => t.id === teamId);
      const saved = await createMember({
        name: member.name,
        role: member.role,
        teamId,
        teamName: dept?.name || teamId,
        responsibilities: member.responsibilities,
        imageUrl: member.imageUrl || undefined,
      });

      if (saved && saved.id) {
        setTeams((prev) => {
          const next = prev.map((t) =>
            t.id === teamId
              ? {
                  ...t,
                  members: t.members.map((m) =>
                    m.id === tempId ? { ...m, id: String(saved.id) } : m
                  ),
                }
              : t
          );
          saveTeams(next);
          return next;
        });
      }
    } catch (err) {
      console.warn("Failed to save member to cloud:", err);
    }
  }, [teams]);

  const updateMember = useCallback(async (teamId: string, memberId: string, patch: Partial<Omit<TeamMemberEntry, "id">>) => {
    setTeams((prev) => {
      const next = prev.map((t) =>
        t.id === teamId
          ? { ...t, members: t.members.map((m) => (m.id === memberId ? { ...m, ...patch } : m)) }
          : t
      );
      saveTeams(next);
      return next;
    });

    try {
      const dept = teams.find((t) => t.id === teamId);
      await apiUpdateMember(memberId, {
        name: patch.name,
        role: patch.role,
        teamId,
        teamName: dept?.name || teamId,
        responsibilities: patch.responsibilities,
        imageUrl: patch.imageUrl !== undefined ? (patch.imageUrl || "") : undefined,
      });
    } catch (err) {
      console.warn("Failed to sync update to cloud:", err);
    }
  }, [teams]);

  const removeMember = useCallback(async (teamId: string, memberId: string) => {
    const target = teams.flatMap((t) => t.members).find((m) => m.id === memberId);
    recordDeleted(memberId, target?.name);

    setTeams((prev) => {
      const next = prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: t.members.filter(
                (m) =>
                  m.id !== memberId &&
                  (!target?.name || m.name.toLowerCase().trim() !== target.name.toLowerCase().trim())
              ),
            }
          : t
      );
      saveTeams(next);
      return next;
    });

    try {
      await apiDeleteMember(memberId, target?.name);
    } catch (err) {
      console.warn("Failed to delete member from cloud:", err);
    }
  }, [teams]);

  const resetToDefaults = useCallback(() => {
    commit(SEED_TEAMS);
  }, [commit]);

  return (
    React.createElement(TeamContext.Provider, {
      value: {
        teams,
        isSyncing,
        addTeam,
        updateTeam,
        removeTeam,
        addMember,
        updateMember,
        removeMember,
        refreshTeams: syncWithCloud,
        resetToDefaults,
      },
      children,
    })
  );
}

export function useTeamStore(): TeamStore {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeamStore must be used inside <TeamProvider>");
  return ctx;
}

// ── Legacy static helpers ─────────────────────────────

export const TEAMS: TeamEntry[] = loadTeams();

export function getTotalMemberCount(): number {
  return TEAMS.reduce((sum, t) => sum + t.members.length, 0);
}

export function getAllMembers(): Array<{ name: string; teamName: string; teamId: string }> {
  return TEAMS.flatMap((t) =>
    t.members.map((m) => ({ name: m.name, teamName: t.name, teamId: t.id }))
  );
}

export function getRegularTeams(): TeamEntry[] {
  return TEAMS.filter((t) => t.id !== "admin");
}

export function getAdminTeam(): TeamEntry | undefined {
  return TEAMS.find((t) => t.id === "admin");
}
