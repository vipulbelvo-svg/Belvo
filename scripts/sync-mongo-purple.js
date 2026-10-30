import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}
import fs from "fs";
import { MongoClient } from "mongodb";

const uri =
  "mongodb://abhichandrabelvo_db_user:DMgbIBPOhQZO8gZ1@ac-cmny1mh-shard-00-00.f4e5dom.mongodb.net:27017,ac-cmny1mh-shard-00-01.f4e5dom.mongodb.net:27017,ac-cmny1mh-shard-00-02.f4e5dom.mongodb.net:27017/belvo?ssl=true&authSource=admin&retryWrites=true&w=majority";

const updates = [
  { nameRegex: /tamil\s*selvan/i, file: "src/collectives/Tamil.png" },
  { nameRegex: /anshika\s*srivastava/i, file: "src/collectives/anshika.png" },
  { nameRegex: /mohammad\s*anasuddin\s*zaid/i, file: "src/collectives/Mohs anas.png" },
  { nameRegex: /sheth\s*yamani/i, file: "src/collectives/seth yamani.png" },
  { nameRegex: /^ishwari/i, file: "src/collectives/ishwari.png" },
];

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("belvo");

  for (const item of updates) {
    const buf = fs.readFileSync(item.file);
    const dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
    const result = await db.collection("team_members").updateMany(
      { name: { $regex: item.nameRegex } },
      { $set: { image_url: dataUrl, updated_at: new Date() } }
    );
    console.log(`Updated in DB: ${item.file} -> Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  }

  await client.close();
  console.log("Done syncing DB with purple t-shirt photos.");
}

run().catch(console.error);
