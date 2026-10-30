/**
 * team-images.ts
 * Centralised image-resolution for team member photos.
 * Photos live in /src/collectives/ and are resolved at build time via Vite glob.
 */

const imageModules = import.meta.glob("/src/collectives/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const IMAGE_MAP: Record<string, string> = {};

// Sort entries so that .png files (purple t-shirts) are processed AFTER .jpeg/.jpg,
// guaranteeing that purple t-shirt photos always take precedence.
const sortedEntries = Object.entries(imageModules).sort(([pathA], [pathB]) => {
  const isPngA = pathA.toLowerCase().endsWith(".png");
  const isPngB = pathB.toLowerCase().endsWith(".png");
  if (!isPngA && isPngB) return -1;
  if (isPngA && !isPngB) return 1;
  return 0;
});

sortedEntries.forEach(([path, url]) => {
  const base = path
    .split("/")
    .pop()!
    .replace(/\.[^.]+$/, "");
  const normalizedKey = base.toLowerCase().trim().replace(/\.+$/, "");
  IMAGE_MAP[normalizedKey] = url;
  const alphaKey = normalizedKey.replace(/[^a-z0-9]/g, "");
  if (alphaKey) {
    IMAGE_MAP[alphaKey] = url;
  }
});

/** Maps display-name variants → image filename keys (without extension). */
export const NAME_OVERRIDES: Record<string, string> = {
  "ram nath g k": "ramnath",
  "saurav": "sourav",
  "sharfudeen": "sharfu",
  "sheth yamani": "sheth yamani",
  "naveen k d": "naveen kumar",
  "shailender": "shilendar",
  "sibijan": "sibi",
  "raavula vaibhav": "vaibhav",
  "sanskruti akare": "sanskruthi",
  "rimi gosh": "rimi",
  "rimi ghosh": "rimi",
  "mohd usaid ali khan": "mohd usaid",
  "mohammad ali": "mohd usaid",
  "mohammad anasuddin zaid": "mohammad anasuddin zaid",
  "anshika srivastava": "anshika srivastava",
  "sri satya": "sri",
  "guru dutt": "guru",
  "anurag khushwaha": "anurag",
  "achintya gurba": "achintya gurba",
  "deepak sharma": "deepak sharma",
  "tamil selvan": "tamil selvan",
  "yash": "yash",
  "chirag arora": "chirag-arora",
  "neha gaikwad": "neha gaikwad",
  "aryan": "aaryan",
  "aditya siras": "aditya siras",
  "anisha verma": "anisha verma",
  "anshul nautiyal": "anshul nautiyal",
  "sujeet kumar": "sujeet kumar",
  "shaik nihayath": "shaik nihayath",
  "sourab reddy": "sourab reddy",
  "gokavarapu yaswanth": "gokavarapu yashwanth",
  "gokavarapu yashwanth": "gokavarapu yashwanth",
  "vivek khalia": "vivek khalia",
};

/**
 * Resolves the best-matching local photo URL for a team member name.
 * Returns `undefined` when no local photo is found.
 */
export function getTeamMemberImage(memberName: string): string | undefined {
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
