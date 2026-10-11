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
Object.entries(imageModules).forEach(([path, url]) => {
  const name = path
    .split("/")
    .pop()!
    .replace(/\.[^.]+$/, "")
    .toLowerCase();
  IMAGE_MAP[name] = url;
});

/** Maps display-name variants → image filename keys (without extension). */
export const NAME_OVERRIDES: Record<string, string> = {
  "ram nath g k": "ramnath",
  "saurav": "sourav",
  "sharfudeen": "sharfu",
  "sheth yamani": "seth yamani",
  "naveen k d": "naveen kumar",
  "shailender": "shilendar",
  "sibijan": "sibi",
  "raavula vaibhav": "vaibhav",
  "sanskruti akare": "sanskruthi",
  "rimi gosh": "rimi",
  "mohd usaid ali khan": "mohd usaid",
  "mohammad ali": "mohd usaid",
  "mohammad anasuddin zaid": "mohs anas",
  "anshika srivastava": "anshika",
  "sri satya": "sri",
  "guru dutt": "guru",
  "anurag khushwaha": "anurag",
  "achintya gurba": "achintya gurba",
  "deepak sharma": "deepak sharma",
  "tamil selvan": "tamil",
  "yash": "yash1",
  "chirag arora": "chirag-arora",
  "neha gaikwad": "",
  "anisha verma": "anisha verma",
  "anshul nautiyal": "anshul nautiyal",
  "sujeet kumar": "sujeet kumar",
  "shaik nihayath": "shaik nihayath",
  "sourab reddy": "sourab reddy",
  "gokavarapu yaswanth": "gokavarapu yaswanth",
  "vivek khalia": "vivek khalia",
};

/**
 * Resolves the best-matching local photo URL for a team member name.
 * Returns `undefined` when no local photo is found.
 */
export function getTeamMemberImage(memberName: string): string | undefined {
  const key = memberName.toLowerCase().trim();
  const override = NAME_OVERRIDES[key];
  if (override !== undefined) {
    if (override === "") return undefined;
    if (IMAGE_MAP[override]) return IMAGE_MAP[override];
  }
  if (IMAGE_MAP[key]) return IMAGE_MAP[key];
  const firstName = key.split(/\s+/)[0];
  if (IMAGE_MAP[firstName]) return IMAGE_MAP[firstName];
  const lastName = key.split(/\s+/).pop()!;
  if (IMAGE_MAP[lastName]) return IMAGE_MAP[lastName];
  const fuzzy = Object.keys(IMAGE_MAP).find(
    (k) => key.includes(k) || k.includes(key)
  );
  if (fuzzy) return IMAGE_MAP[fuzzy];
  return undefined;
}
