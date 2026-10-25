import dns from "dns";
if (!process.env.VERCEL) {
  try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}
}
import { MongoClient, ObjectId } from "mongodb";

let _client = undefined;
let _db = undefined;

const FALLBACK_MONGODB_URI =
  "mongodb+srv://abhichandrabelvo_db_user:DMgbIBPOhQZO8gZ1@cluster0.f4e5dom.mongodb.net/belvo?retryWrites=true&w=majority";

function getClient() {
  if (_client === undefined) {
    const uri = process.env.MONGODB_URI || FALLBACK_MONGODB_URI;

    if (!uri) {
      console.error("Missing MongoDB credentials. Set MONGODB_URI.");
      _client = null;
    } else {
      _client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 15000,
      });
    }
  }
  return _client;
}

export async function getDb() {
  const client = getClient();
  if (!client) throw new Error("Database not configured — set MONGODB_URI");
  if (!_db) {
    await client.connect();
    _db = client.db(process.env.MONGODB_DB || "belvo");
  }
  return _db;
}

export async function collection(name) {
  const db = await getDb();
  return db.collection(name);
}

export async function isDbReady() {
  const client = getClient();
  if (!client) return false;
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch (err) {
    console.error("MongoDB connection failed:", err?.message);
    return false;
  }
}

export { ObjectId };
