import dns from "dns";
if (!process.env.VERCEL) {
  try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}
}
import { MongoClient, ObjectId } from "mongodb";

let _client = undefined;
let _db = undefined;

const FALLBACK_MONGODB_URI =
  "mongodb://abhichandrabelvo_db_user:DMgbIBPOhQZO8gZ1@ac-cmny1mh-shard-00-00.f4e5dom.mongodb.net:27017,ac-cmny1mh-shard-00-01.f4e5dom.mongodb.net:27017,ac-cmny1mh-shard-00-02.f4e5dom.mongodb.net:27017/belvo?ssl=true&replicaSet=atlas-l6d21t-shard-0&authSource=admin&retryWrites=true&w=majority";

function getValidMongoUri() {
  let envUri = (process.env.MONGODB_URI || "").trim();
  if ((envUri.startsWith('"') && envUri.endsWith('"')) || (envUri.startsWith("'") && envUri.endsWith("'"))) {
    envUri = envUri.slice(1, -1).trim();
  }
  if (envUri.startsWith("mongodb://") || envUri.startsWith("mongodb+srv://")) {
    return envUri;
  }
  return FALLBACK_MONGODB_URI;
}

function getClient() {
  if (_client === undefined) {
    const uri = getValidMongoUri();
    _client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
    });
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
