import fs from "fs";

const teamImagesCode = fs.readFileSync("src/lib/team-images.ts", "utf8");
const files = fs.readdirSync("src/collectives");

// Simulate team-images logic
const IMAGE_MAP = {};
const sortedFiles = files.slice().sort((a, b) => {
  const aPng = a.toLowerCase().endsWith(".png");
  const bPng = b.toLowerCase().endsWith(".png");
  if (!aPng && bPng) return -1;
  if (aPng && !bPng) return 1;
  return 0;
});

for (const f of sortedFiles) {
  const base = f.replace(/\.[^.]+$/, "").toLowerCase().trim().replace(/\.+$/, "");
  IMAGE_MAP[base] = f;
  IMAGE_MAP[base.replace(/[^a-z0-9]/g, "")] = f;
}

// Extract NAME_OVERRIDES from team-images.ts
const overrideMatches = teamImagesCode.match(/export const NAME_OVERRIDES: Record<string, string> = {([\s\S]*?)};/);
const NAME_OVERRIDES = {};
if (overrideMatches) {
  const lines = overrideMatches[1].split("\n");
  for (const line of lines) {
    const m = line.match(/"([^"]+)":\s*"([^"]*)"/);
    if (m) NAME_OVERRIDES[m[1]] = m[2];
  }
}

function resolveImage(memberName) {
  if (!memberName) return undefined;
  const raw = memberName.toLowerCase().trim();
  const clean = raw.replace(/\.+$/, "").trim();
  const alpha = clean.replace(/[^a-z0-9]/g, "");

  const override = NAME_OVERRIDES[clean] || NAME_OVERRIDES[raw] || NAME_OVERRIDES[alpha];
  if (override !== undefined) {
    if (override === "") return undefined;
    if (IMAGE_MAP[override]) return IMAGE_MAP[override];
    const alphaOverride = override.replace(/[^a-z0-9]/g, "");
    if (IMAGE_MAP[alphaOverride]) return IMAGE_MAP[alphaOverride];
  }

  if (IMAGE_MAP[clean]) return IMAGE_MAP[clean];
  if (IMAGE_MAP[raw]) return IMAGE_MAP[raw];
  if (IMAGE_MAP[alpha]) return IMAGE_MAP[alpha];

  return undefined;
}

// Read SEED_TEAMS
const storeCode = fs.readFileSync("src/lib/team-store.ts", "utf8");
const memberMatches = storeCode.matchAll(/makeMember\("([^"]+)"/g);
const seedMembers = [];
for (const m of memberMatches) {
  seedMembers.push(m[1]);
}

console.log("Total members in SEED_TEAMS:", seedMembers.length);
let resolvedCount = 0;
const unresolved = [];
const resolvedPng = [];
const resolvedJpeg = [];

for (const name of seedMembers) {
  const img = resolveImage(name);
  if (img) {
    resolvedCount++;
    if (img.endsWith(".png")) resolvedPng.push({ name, img });
    else resolvedJpeg.push({ name, img });
  } else {
    unresolved.push(name);
  }
}

console.log(`Resolved: ${resolvedCount}/${seedMembers.length}`);
console.log(`- Purple PNGs: ${resolvedPng.length}`);
console.log(`- JPEGs: ${resolvedJpeg.length}`);
if (unresolved.length > 0) {
  console.log("Unresolved:", unresolved);
}
