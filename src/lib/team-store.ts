/**
 * team-store.ts
 * Reactive team data store backed by localStorage.
 * Provides a React context so edits made in the dashboard are instantly
 * reflected on the public TeamSection without a page reload.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ─────────────────────────────────────────────

export interface TeamMemberEntry {
  /** Unique within the team */
  id: string;
  name: string;
  /** Data-URL (for newly uploaded photos) or null */
  imageUrl?: string | null;
  responsibilities?: string[];
  role?: string;
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

const SEED_TEAMS: TeamEntry[] = [
  {
    id: "web",
    name: "Web Development",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      "Lokesh", "Sri Satya", "Akhil",
      "Mohammad Anasuddin Zaid", "Ishwari",
      "Sandali", "Tamil Selvan", "Ram Nath G K",
      "Guru dutt", "Shailender",
      "Aditya Sarkar", "Divyansh Salanki", "Harshitha",
      "Chirag Arora", "Prathamesh Kharbal", "Himagiri Siddesh", "Yashwanth Polepalli",
      "Varsha", "Anuj Kumar", "Anshul Nautiyal", "Sourab Reddy", "Gokavarapu Yaswanth",
    ].map((n) => makeMember(n)),
  },
  {
    id: "app",
    name: "App Development",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      "Anand", "Anshika Srivastava", "Aaryan", "Suhani", "Aman",
      "Naveen Kumar", "Sushmitha", "Sinchana", "Hari Chandra Sekhar", "Dasari Ganesh",
    ].map((n) => makeMember(n)),
  },
  {
    id: "cyber",
    name: "Cyber Security",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: ["Harsh", "Sourav", "Parv", "Ankit Sharma"].map((n) => makeMember(n)),
  },
  {
    id: "software",
    name: "Software Development",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      "Aditya Siras", "Rudra Matta", "Ankush Gemnnani", "Aditya Singh",
      "Aryan", "Neha Gaikwad", "Vivek Kumar",
    ].map((n) => makeMember(n)),
  },
  {
    id: "analytics",
    name: "Business & Data Analytics",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      "Ishika", "Obed", "Sasikumar", "Sharfudeen",
      "Sibijan", "Tejaswini", "Sujeet Kumar",
    ].map((n) => makeMember(n)),
  },
  {
    id: "graphic",
    name: "Graphic Designing",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: [
      "Anurag khushwaha", "Rimi ghosh", "Sanskruti akare",
      "Deepak Sharma", "Neha", "Yash", "Shaik Nihayath",
    ].map((n) => makeMember(n)),
  },
  {
    id: "social",
    name: "Social Media Management",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: ["Yash Mewati", "Anisha Verma"].map((n) => makeMember(n)),
  },
  {
    id: "content",
    name: "Content Writer",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: ["Sheth Yamani"].map((n) => makeMember(n)),
  },
  {
    id: "cinematography",
    name: "Cinematography",
    color: "#0b3b9c",
    lightColor: "#5ba9e6",
    members: ["Adarsh"].map((n) => makeMember(n)),
  },
  {
    id: "admin",
    name: "Human Resources",
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
    ],
  },
];

// ── Persistence ───────────────────────────────────────

const STORAGE_KEY = "belvo_teams_v1";

function loadTeams(): TeamEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_TEAMS;
    const parsed = JSON.parse(raw) as TeamEntry[];
    // make sure every member has an id (migrate old data)
    return parsed.map((t) => ({
      ...t,
      members: t.members.map((m) => ({
        ...m,
        id: m.id || m.name.toLowerCase().replace(/\s+/g, "-"),
      })),
    }));
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

  // Department CRUD
  addTeam(team: Omit<TeamEntry, "members">): void;
  updateTeam(id: string, patch: Partial<Omit<TeamEntry, "id" | "members">>): void;
  removeTeam(id: string): void;

  // Member CRUD
  addMember(teamId: string, member: Omit<TeamMemberEntry, "id">): void;
  updateMember(teamId: string, memberId: string, patch: Partial<Omit<TeamMemberEntry, "id">>): void;
  removeMember(teamId: string, memberId: string): void;

  // Reset
  resetToDefaults(): void;
}

const TeamContext = createContext<TeamStore | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<TeamEntry[]>(loadTeams);

  const commit = useCallback((next: TeamEntry[]) => {
    setTeams(next);
    saveTeams(next);
  }, []);

  const addTeam = useCallback((team: Omit<TeamEntry, "members">) => {
    commit([...teams, { ...team, members: [] }]);
  }, [teams, commit]);

  const updateTeam = useCallback((id: string, patch: Partial<Omit<TeamEntry, "id" | "members">>) => {
    commit(teams.map((t) => t.id === id ? { ...t, ...patch } : t));
  }, [teams, commit]);

  const removeTeam = useCallback((id: string) => {
    commit(teams.filter((t) => t.id !== id));
  }, [teams, commit]);

  const addMember = useCallback((teamId: string, member: Omit<TeamMemberEntry, "id">) => {
    commit(teams.map((t) =>
      t.id === teamId
        ? { ...t, members: [...t.members, { ...member, id: uid() }] }
        : t
    ));
  }, [teams, commit]);

  const updateMember = useCallback((teamId: string, memberId: string, patch: Partial<Omit<TeamMemberEntry, "id">>) => {
    commit(teams.map((t) =>
      t.id === teamId
        ? { ...t, members: t.members.map((m) => m.id === memberId ? { ...m, ...patch } : m) }
        : t
    ));
  }, [teams, commit]);

  const removeMember = useCallback((teamId: string, memberId: string) => {
    commit(teams.map((t) =>
      t.id === teamId
        ? { ...t, members: t.members.filter((m) => m.id !== memberId) }
        : t
    ));
  }, [teams, commit]);

  const resetToDefaults = useCallback(() => {
    commit(SEED_TEAMS);
  }, [commit]);

  return (
    React.createElement(TeamContext.Provider, {
      value: { teams, addTeam, updateTeam, removeTeam, addMember, updateMember, removeMember, resetToDefaults },
      children,
    })
  );
}

export function useTeamStore(): TeamStore {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeamStore must be used inside <TeamProvider>");
  return ctx;
}

// ── Legacy static helpers (still used by non-context callers) ────────────

/** Returns a live snapshot of TEAMS from localStorage (or seed).
 *  Use `useTeamStore().teams` inside React components instead. */
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
