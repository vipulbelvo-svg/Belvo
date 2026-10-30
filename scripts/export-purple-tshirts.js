import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

const uri =
  "mongodb://abhichandrabelvo_db_user:DMgbIBPOhQZO8gZ1@ac-cmny1mh-shard-00-00.f4e5dom.mongodb.net:27017,ac-cmny1mh-shard-00-01.f4e5dom.mongodb.net:27017,ac-cmny1mh-shard-00-02.f4e5dom.mongodb.net:27017/belvo?ssl=true&authSource=admin&retryWrites=true&w=majority";

const COLLECTIVES_DIR = path.resolve("src", "collectives");

function cleanMemberName(rawName) {
  return rawName.trim().replace(/\.+$/, "").trim();
}

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("belvo");

  const members = await db.collection("team_members").find({}).sort({ sort_order: 1, name: 1 }).toArray();
  console.log(`Found ${members.length} members in team_members collection.`);

  let savedCount = 0;
  const savedFiles = [];

  for (const m of members) {
    const cleanName = cleanMemberName(m.name);
    if (!m.image_url || !m.image_url.startsWith("data:")) {
      console.warn(`[SKIP] No data URL for ${m.name}`);
      continue;
    }

    const matches = m.image_url.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.warn(`[SKIP] Malformed data URL for ${m.name}`);
      continue;
    }

    const mime = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Standardize file naming in src/collectives/
    // We will save as .png (or .jpeg if original mime was jpeg)
    // To ensure Vite bundles it as a clean local asset, save as cleanName.png
    // Also remove any existing old .jpeg for this cleanName if it's the old photo
    const ext = mime.includes("png") ? ".png" : ".png"; // saving as .png
    const fileName = `${cleanName}.png`;
    const filePath = path.join(COLLECTIVES_DIR, fileName);

    fs.writeFileSync(filePath, buffer);
    savedCount++;
    savedFiles.push({
      originalName: m.name,
      cleanName,
      fileName,
      sizeBytes: buffer.length,
      team: m.team_name || m.team_id,
      role: m.role || "",
    });
  }

  console.log(`Successfully saved ${savedCount} purple t-shirt photos to ${COLLECTIVES_DIR}`);

  // Also write a metadata summary
  fs.writeFileSync(
    path.resolve("scripts", "exported-members.json"),
    JSON.stringify(savedFiles, null, 2)
  );

  await client.close();
}

run().catch((err) => {
  console.error("Export error:", err);
  process.exit(1);
});
