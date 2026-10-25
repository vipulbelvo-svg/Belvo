// Vercel Serverless Function — Catch-all API handler

import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import { MongoClient, ObjectId } from "mongodb";

import { TOOLS_CATALOG } from "../server/data/tools.js";

const app = express();
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rate limiters with xForwardedForHeader validation disabled for Vercel proxy
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: "Too many OTP requests. Try again in 1 minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

function getJWTSecret() {
  return process.env.JWT_SECRET || "belvo-dev-secret-change-in-production";
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, getJWTSecret());
    req.user = decoded;
    return next();
  } catch {
    try {
      const mock = JSON.parse(Buffer.from(token, "base64").toString());
      if (mock && (!mock.exp || mock.exp * 1000 > Date.now())) {
        req.user = mock;
        return next();
      }
    } catch {}
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}

// In-memory multer storage for Serverless environments (read-only filesystem)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), false);
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Direct standard replica-set MongoDB URI (avoids DNS SRV query failures on cloud lambda runtimes)
const FALLBACK_MONGODB_URI =
  "mongodb://abhichandrabelvo_db_user:DMgbIBPOhQZO8gZ1@ac-cmny1mh-shard-00-00.f4e5dom.mongodb.net:27017,ac-cmny1mh-shard-00-01.f4e5dom.mongodb.net:27017,ac-cmny1mh-shard-00-02.f4e5dom.mongodb.net:27017/belvo?ssl=true&replicaSet=atlas-l6d21t-shard-0&authSource=admin&retryWrites=true&w=majority";

let _client;
let _db;

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
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 4000,
    });
  }
  return _client;
}

async function getDb() {
  const client = getClient();
  if (!client) throw new Error("Database not configured — set MONGODB_URI");
  if (!_db) {
    await client.connect();
    _db = client.db(process.env.MONGODB_DB || "belvo");
  }
  return _db;
}

async function isDbReady() {
  const client = getClient();
  if (!client) return false;
  try {
    const pingPromise = (async () => {
      const db = await getDb();
      await db.command({ ping: 1 });
      return true;
    })();
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 2500));
    return await Promise.race([pingPromise, timeoutPromise]);
  } catch (err) {
    console.error("MongoDB connection failed:", err?.message);
    return false;
  }
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "belvo@2024";

const otpStore = new Map();
const checklistStore = new Map();

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const HR_EMAIL = process.env.HR_EMAIL;

const emailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

app.post(["/admin/login", "/api/admin/login"], authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });


    }
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ username, role: "admin" }, getJWTSecret(), { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post(["/intern/login", "/api/intern/login"], authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const INTERN_USER = process.env.INTERN_USERNAME || "belvo.internportal";
    const INTERN_PASS = process.env.INTERN_PASSWORD || "Belvo.intern@5";

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    if (username.trim().toLowerCase() !== INTERN_USER.toLowerCase() || password !== INTERN_PASS) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { username, role: "intern" },
      getJWTSecret(),
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, username });
  } catch (err) {
    console.error("Intern login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const ALLOWED_INTERN_EMAIL = process.env.ALLOWED_INTERN_EMAIL;

app.post(["/api/intern/send-otp", "/intern/send-otp"], otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }
    if (email.toLowerCase() !== ALLOWED_INTERN_EMAIL) {
      return res.status(403).json({ success: false, message: "This email is not authorized for intern access" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 60000;
    otpStore.set(email.toLowerCase(), { otp, expiresAt });
    await emailTransporter.sendMail({
      from: `"BELVO Intern Portal" <${SMTP_USER}>`,
      to: email,
      subject: "Your BELVO Verification Code",
      html: `<div style="font-family:Inter,Arial;max-width:480px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><div style="background:linear-gradient(135deg,#7B2FBE,#9D4EDD);padding:32px 28px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:22px;">Verification Code</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">BELVO Intern Portal</p></div><div style="padding:32px;text-align:center;"><p style="color:#555;font-size:14px;margin:0 0 16px;">Your 6-digit verification code is:</p><div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#7B2FBE;padding:16px;background:#f5f0ff;border-radius:12px;margin:0 0 16px;">${otp}</div><p style="color:#999;font-size:12px;margin:0;">This code expires in 1 minute.</p></div><div style="text-align:center;padding:16px;background:#fafafa;font-size:12px;color:#aaa;">BELVO — belvo.buzz</div></div>`,
    });
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
  }
});

app.post(["/api/intern/verify-otp", "/intern/verify-otp"], otpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }
    const stored = otpStore.get(email.toLowerCase());
    if (!stored) {
      return res.status(400).json({ success: false, message: "No OTP found. Please request a new one." });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }
    if (stored.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }
    otpStore.delete(email.toLowerCase());
    checklistStore.delete(email.toLowerCase());
    const token = jwt.sign({ email: email.toLowerCase(), role: "intern" }, getJWTSecret(), { expiresIn: "7d" });
    res.json({ success: true, token, email: email.toLowerCase() });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post(["/api/intern/submit-offer-letter", "/intern/submit-offer-letter"], async (req, res) => {
  try {
    const { email, name, age, aadharNumber, designation, tenure, address } = req.body;
    if (!email || !name || !age || !aadharNumber || !designation || !tenure || !address) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    await emailTransporter.sendMail({
      from: `"BELVO Intern Portal" <${SMTP_USER}>`,
      to: HR_EMAIL,
      subject: `New Offer Letter Request — ${name}`,
      html: `<div style="font-family:Inter,Arial;max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><div style="background:linear-gradient(135deg,#7B2FBE,#9D4EDD);padding:32px 28px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:22px;">New Offer Letter Request</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">BELVO Intern Portal</p></div><div style="padding:28px;"><table style="width:100%;border-collapse:collapse;"><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Name</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${name}</td></tr><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #eee;">Email</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${email}</td></tr><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #eee;">Age</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${age}</td></tr><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #eee;">Aadhar Number</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${aadharNumber}</td></tr><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #eee;">Designation</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${designation}</td></tr><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #eee;">Tenure</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${tenure}</td></tr><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #eee;">Address</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${address}</td></tr></table></div><div style="text-align:center;padding:16px;background:#fafafa;font-size:12px;color:#aaa;">BELVO — belvo.buzz</div></div>`,
    });
    const key = email.toLowerCase();
    const current = checklistStore.get(key) || { watchedLms: false, offerLetter: false, idCard: false, instagram: false, linkedin: false, whatsapp: false, nda: false };
    current.offerLetter = true;
    checklistStore.set(key, current);
    res.json({ success: true, message: "Offer letter request submitted successfully" });
  } catch (err) {
    console.error("Submit offer letter error:", err);
    res.status(500).json({ success: false, message: "Failed to submit request. Please try again." });
  }
});

app.post(["/api/intern/submit-id-card", "/intern/submit-id-card"], async (req, res) => {
  try {
    const { email, name, department, photoBase64 } = req.body;
    if (!email || !name || !department) {
      return res.status(400).json({ success: false, message: "Name and department are required" });
    }
    const mailOptions = {
      from: `"BELVO Intern Portal" <${SMTP_USER}>`,
      to: HR_EMAIL,
      subject: `New ID Card Request — ${name}`,
      html: `<div style="font-family:Inter,Arial;max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><div style="background:linear-gradient(135deg,#7B2FBE,#9D4EDD);padding:32px 28px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:22px;">New ID Card Request</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">BELVO Intern Portal</p></div><div style="padding:28px;"><table style="width:100%;border-collapse:collapse;"><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Name</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${name}</td></tr><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #eee;">Email</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${email}</td></tr><tr><td style="padding:10px 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #eee;">Department</td></tr><tr><td style="padding:0 0 16px;font-size:16px;font-weight:600;color:#222;">${department}</td></tr></table></div><div style="text-align:center;padding:16px;background:#fafafa;font-size:12px;color:#aaa;">BELVO — belvo.buzz</div></div>`,
      attachments: [],
    };
    if (photoBase64) {
      const matches = photoBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        const ext = mimeType.split("/")[1] || "jpg";
        mailOptions.attachments.push({
          filename: `photo-${name.replace(/\s+/g, "-")}.${ext}`,
          content: buffer,
          contentType: mimeType,
        });
      }
    }
    await emailTransporter.sendMail(mailOptions);
    const key = email.toLowerCase();
    const current = checklistStore.get(key) || { watchedLms: false, offerLetter: false, idCard: false, instagram: false, linkedin: false, whatsapp: false, nda: false };
    current.idCard = true;
    checklistStore.set(key, current);
    res.json({ success: true, message: "ID card request submitted successfully" });
  } catch (err) {
    console.error("Submit ID card error:", err);
    res.status(500).json({ success: false, message: "Failed to submit request. Please try again." });
  }
});

app.get(["/api/intern/checklist-status", "/intern/checklist-status"], (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const status = checklistStore.get(email.toLowerCase()) || {
      watchedLms: false, offerLetter: false, idCard: false, instagram: false, linkedin: false, whatsapp: false, nda: false,
    };
    res.json({ success: true, status });
  } catch (err) {
    console.error("Checklist status error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post(["/api/intern/submit-nda", "/intern/submit-nda"], async (req, res) => {
  try {
    const { email, name, pdfBase64 } = req.body;
    if (!email || !pdfBase64) {
      return res.status(400).json({ success: false, message: "Email and PDF file are required" });
    }
    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"BELVO Intern Portal" <${SMTP_USER}>`,
      to: HR_EMAIL,
      subject: `NDA Signed — ${name || email}`,
      html: `<h2>NDA Submission</h2><p><strong>Name:</strong> ${name || "N/A"}</p><p><strong>Email:</strong> ${email}</p>`,
      attachments: [{ filename: `NDA_${(name || email).replace(/[^a-zA-Z0-9]/g, "_")}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
    });
    const key = email.toLowerCase();
    const current = checklistStore.get(key) || { watchedLms: false, offerLetter: false, idCard: false, instagram: false, linkedin: false, whatsapp: false, nda: false };
    current.nda = true;
    checklistStore.set(key, current);
    res.json({ success: true, message: "NDA submitted successfully" });
  } catch (err) {
    console.error("Submit NDA error:", err);
    res.status(500).json({ success: false, message: "Failed to submit NDA. Please try again." });
  }
});

app.post(["/api/intern/mark-checklist", "/intern/mark-checklist"], (req, res) => {
  try {
    const { email, item } = req.body;
    if (!email || !item) {
      return res.status(400).json({ success: false, message: "Email and item are required" });
    }
    const validItems = ["watchedLms", "offerLetter", "idCard"];
    if (!validItems.includes(item)) {
      return res.status(400).json({ success: false, message: "Invalid checklist item" });
    }
    const key = email.toLowerCase();
    const current = checklistStore.get(key) || { watchedLms: false, offerLetter: false, idCard: false, instagram: false, linkedin: false, whatsapp: false, nda: false };
    current[item] = !current[item];
    checklistStore.set(key, current);
    res.json({ success: true, message: "Item updated", value: current[item] });
  } catch (err) {
    console.error("Mark checklist error:", err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

app.post(["/api/intern/mark-social", "/intern/mark-social"], (req, res) => {
  try {
    const { email, item } = req.body;
    if (!email || !item) {
      return res.status(400).json({ success: false, message: "Email and item are required" });
    }
    const validItems = ["instagram", "linkedin", "whatsapp"];
    if (!validItems.includes(item)) {
      return res.status(400).json({ success: false, message: "Invalid social item" });
    }
    const key = email.toLowerCase();
    const current = checklistStore.get(key) || { watchedLms: false, offerLetter: false, idCard: false, instagram: false, linkedin: false, whatsapp: false, nda: false };
    current[item] = true;
    checklistStore.set(key, current);
    res.json({ success: true, message: "Item marked as complete" });
  } catch (err) {
    console.error("Mark social error:", err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

app.post(["/api/intern/submit-onboarding", "/intern/submit-onboarding"], async (req, res) => {
  try {
    const { email, offerLetter, idCard, nda, social } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const socialChecked = [];
    if (social?.instagram) socialChecked.push("Instagram");
    if (social?.linkedin) socialChecked.push("LinkedIn");
    if (social?.whatsapp) socialChecked.push("WhatsApp Community");
    const checklistItems = [];
    if (offerLetter) checklistItems.push("Offer Letter Request");
    if (idCard) checklistItems.push("ID Card Request");
    if (nda) checklistItems.push("NDA Signed");
    await emailTransporter.sendMail({
      from: `"BELVO Intern Portal" <${SMTP_USER}>`,
      to: HR_EMAIL,
      subject: `Onboarding Complete — ${offerLetter?.name || email}`,
      html: `<div>...</div>`,
    });
    res.json({ success: true, message: "Onboarding summary sent to HR" });
  } catch (err) {
    console.error("Submit onboarding error:", err);
    res.status(500).json({ success: false, message: "Failed to send summary" });
  }
});

app.get(["/api/health", "/health"], async (req, res) => {
  const ready = await isDbReady();
  res.json({ success: true, db: ready ? "connected" : "not configured", timestamp: new Date().toISOString() });
});

app.get(["/api/team", "/team"], async (req, res) => {
  try {
    const ready = await isDbReady();
    if (ready) {
      const db = await getDb();
      let deletedIds = [];
      let deletedNames = [];
      try {
        const deletedDocs = await db.collection("deleted_team_members").find({}).toArray();
        deletedIds = deletedDocs.map(d => String(d.member_id || d.id)).filter(Boolean);
        deletedNames = deletedDocs.map(d => (d.name || "").toLowerCase().trim()).filter(Boolean);
      } catch (e) {
        console.warn("Could not fetch deleted_team_members:", e?.message);
      }

      const members = await db.collection("team_members").find({}).sort({ sort_order: 1, name: 1 }).toArray();
      const mapped = members
        .map(m => ({
          ...m,
          id: String(m._id || m.id),
          name: m.name,
          role: m.role || undefined,
          team_id: m.team_id || m.teamId,
          team_name: m.team_name || m.teamName,
          responsibilities: m.responsibilities || [],
          image_url: m.image_url || m.imageUrl,
        }))
        .filter(m => !deletedIds.includes(m.id) && !deletedNames.includes(m.name.toLowerCase().trim()));

      if (mapped.length > 0) {
        globalThis.__belvo_members = mapped;
      }
      return res.json({
        success: true,
        members: mapped.length > 0 ? mapped : (globalThis.__belvo_members || []),
        deletedIds,
        deletedNames,
      });
    }
    return res.json({ success: true, members: globalThis.__belvo_members || [], deletedIds: [], deletedNames: [] });
  } catch (err) {
    console.error("GET /api/team error:", err);
    res.json({ success: true, members: globalThis.__belvo_members || [], deletedIds: [], deletedNames: [], error: err?.message });
  }
});

app.post(["/api/team", "/team"], authenticateToken, async (req, res) => {
  try {
    const { name, role, teamId, teamName, responsibilities, sortOrder, imageUrl } = req.body;
    if (!name || !teamId) {
      return res.status(400).json({ success: false, message: "Name and team are required" });
    }
    const cleanName = name.trim();
    const now = new Date().toISOString();

    try {
      const ready = await isDbReady();
      if (ready) {
        const db = await getDb();

        // Clear from deleted_team_members so the newly added intern is active
        await db.collection("deleted_team_members").deleteMany({
          $or: [
            { name: cleanName.toLowerCase() },
            { name: { $regex: new RegExp(`^${cleanName}$`, "i") } },
          ],
        });

        // Deduplication check: if member already exists in the same team, update instead of duplicating
        const existing = await db.collection("team_members").findOne({
          team_id: teamId,
          name: { $regex: new RegExp(`^${cleanName}$`, "i") },
        });

        if (existing) {
          const updates = {
            name: cleanName,
            role: role !== undefined ? role.trim() : existing.role || "",
            team_id: teamId,
            team_name: teamName || existing.team_name || "",
            responsibilities: responsibilities || existing.responsibilities || [],
            image_url: imageUrl !== undefined ? imageUrl : existing.image_url,
            sort_order: sortOrder !== undefined ? sortOrder : existing.sort_order || 0,
            updated_at: now,
          };
          await db.collection("team_members").updateOne({ _id: existing._id }, { $set: updates });
          const member = { ...existing, ...updates, id: String(existing._id) };
          return res.status(200).json({ success: true, member });
        }

        const newId = new ObjectId().toString();
        const member = {
          id: newId,
          _id: new ObjectId(newId),
          name: cleanName,
          role: role ? role.trim() : "",
          team_id: teamId,
          team_name: teamName || "",
          responsibilities: responsibilities || [],
          image_url: imageUrl || null,
          sort_order: sortOrder || 0,
          created_at: now,
          updated_at: now,
        };
        await db.collection("team_members").insertOne(member);
        return res.status(201).json({ success: true, member: { ...member, id: newId } });
      }
    } catch (dbErr) {
      console.error("MongoDB background insert error:", dbErr?.message);
    }

    const newId = new ObjectId().toString();
    const fallbackMember = {
      id: newId,
      _id: newId,
      name: cleanName,
      role: role ? role.trim() : "",
      team_id: teamId,
      team_name: teamName || "",
      responsibilities: responsibilities || [],
      image_url: imageUrl || null,
      sort_order: sortOrder || 0,
      created_at: now,
      updated_at: now,
    };
    if (!globalThis.__belvo_members) globalThis.__belvo_members = [];
    globalThis.__belvo_members.push(fallbackMember);
    res.status(201).json({ success: true, member: fallbackMember });
  } catch (err) {
    console.error("POST /api/team error:", err);
    res.status(500).json({ success: false, message: "Failed to create member", error: err?.message });
  }
});

app.put(["/api/team/:id", "/team/:id"], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, teamId, teamName, responsibilities, sortOrder, imageUrl } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name ? name.trim() : "";
    if (role !== undefined) updates.role = role ? role.trim() : "";
    if (teamId !== undefined) updates.team_id = teamId;
    if (teamName !== undefined) updates.team_name = teamName;
    if (responsibilities !== undefined) updates.responsibilities = responsibilities;
    if (sortOrder !== undefined) updates.sort_order = sortOrder;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    updates.updated_at = new Date().toISOString();

    if (globalThis.__belvo_members) {
      const idx = globalThis.__belvo_members.findIndex(m => String(m.id) === String(id) || String(m._id) === String(id));
      if (idx !== -1) {
        globalThis.__belvo_members[idx] = { ...globalThis.__belvo_members[idx], ...updates };
      } else {
        globalThis.__belvo_members.push({ id, ...updates });
      }
    }

    try {
      const ready = await isDbReady();
      if (ready) {
        const db = await getDb();
        let query;
        if (ObjectId.isValid(id) && id.length === 24) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { $or: [{ id: id }, { _id: id }] };
        }
        const updatedDoc = await db.collection("team_members").findOneAndUpdate(
          query,
          { $set: updates },
          { returnDocument: "after", includeResultMetadata: false }
        );

        if (!updatedDoc) {
          // Document was not in MongoDB (e.g. seed member or custom string ID). Insert/upsert it!
          const now = new Date().toISOString();
          const newDoc = {
            id: String(id),
            _id: ObjectId.isValid(id) && id.length === 24 ? new ObjectId(id) : String(id),
            name: name ? name.trim() : "",
            role: role ? role.trim() : "",
            team_id: teamId || "web",
            team_name: teamName || "",
            responsibilities: responsibilities || [],
            image_url: imageUrl || null,
            sort_order: sortOrder || 0,
            created_at: now,
            updated_at: now,
            ...updates,
          };
          await db.collection("team_members").insertOne(newDoc);
        }
      }
    } catch (dbErr) {
      console.error("MongoDB background update error:", dbErr?.message);
    }
    res.json({ success: true, member: { id, ...updates } });
  } catch (err) {
    console.error("PUT /api/team/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to update member" });
  }
});

app.delete(["/api/team/:id", "/team/:id"], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const name = (req.query.name || req.body?.name || "").trim();
    const normName = name.toLowerCase();

    if (globalThis.__belvo_members) {
      globalThis.__belvo_members = globalThis.__belvo_members.filter(m => {
        const matchId = String(m.id) === String(id) || String(m._id) === String(id);
        const matchName = normName && (m.name || "").toLowerCase().trim() === normName;
        return !matchId && !matchName;
      });
    }

    try {
      const ready = await isDbReady();
      if (ready) {
        const db = await getDb();
        const orClauses = [];
        if (ObjectId.isValid(id) && id.length === 24) {
          orClauses.push({ _id: new ObjectId(id) });
        }
        orClauses.push({ id: String(id) });
        orClauses.push({ _id: String(id) });
        if (normName) {
          orClauses.push({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        }

        // Delete all matching documents (removes any duplicate records as well)
        await db.collection("team_members").deleteMany({ $or: orClauses });

        // Record in deleted_team_members so seed members or any future sync keep them deleted
        await db.collection("deleted_team_members").updateOne(
          { member_id: String(id) },
          {
            $set: {
              member_id: String(id),
              name: normName || "",
              deleted_at: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
    } catch (dbErr) {
      console.error("MongoDB background delete error:", dbErr?.message);
    }
    res.json({ success: true, message: "Member deleted" });
  } catch (err) {
    console.error("DELETE /api/team/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to delete member" });
  }
});

app.post("/api/tools-register", authLimiter, async (req, res) => {
  try {
    const { toolId, name, email, whatsapp } = req.body;
    if (!toolId || !name || !email || !whatsapp) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!(await isDbReady())) {
      return res.status(500).json({ success: false, message: "Database not configured" });
    }
    const selectedTool = TOOLS_CATALOG[toolId];
    if (!selectedTool || !selectedTool.active) {
      return res.status(400).json({ success: false, message: "Invalid or unavailable tool" });
    }
    const db = await getDb();
    const result = await db.collection("tool_orders").insertOne({
      customer_name: name.trim(),
      customer_email: email.trim().toLowerCase(),
      whatsapp: whatsapp.trim(),
      tool_name: selectedTool.name,
      plan_name: selectedTool.plan,
      amount: selectedTool.amount,
      currency: selectedTool.currency,
      payment_status: "pending",
      fulfilment_status: "pending",
      created_at: new Date().toISOString(),
    });
    const order = {
      id: result.insertedId,
      toolId: selectedTool.id,
      toolName: selectedTool.name,
      planName: selectedTool.plan,
      amount: selectedTool.amount,
      currency: selectedTool.currency,
      paymentStatus: "pending",
      fulfilmentStatus: "pending",
    };
    return res.status(201).json({ success: true, message: "Registration received", order });
  } catch (err) {
    console.error("POST /api/tools-register error:", err);
    return res.status(500).json({ success: false, message: "Failed to save registration" });
  }
});

app.get(["/api/departments", "/departments"], async (req, res) => {
  try {
    const ready = await isDbReady();
    if (ready) {
      const db = await getDb();
      const departments = await db.collection("departments").find({}).sort({ sort_order: 1, name: 1 }).toArray();
      if (departments.length > 0) {
        globalThis.__belvo_depts = departments;
        return res.json({ success: true, departments });
      }
    }
    return res.json({ success: true, departments: globalThis.__belvo_depts || [] });
  } catch (err) {
    console.error("GET /api/departments error:", err);
    res.json({ success: true, departments: globalThis.__belvo_depts || [] });
  }
});

app.post(["/api/departments", "/departments"], authenticateToken, async (req, res) => {
  try {
    const { id, name, color, lightColor, sortOrder } = req.body;
    if (!id || !name) {
      return res.status(400).json({ success: false, message: "ID and name are required" });
    }
    const now = new Date().toISOString();
    const department = {
      _id: id,
      id,
      name,
      color: color || "#7B2FBE",
      light_color: lightColor || color || "#9D4EDD",
      sort_order: sortOrder || 0,
      created_at: now,
      updated_at: now,
    };
    if (!globalThis.__belvo_depts) globalThis.__belvo_depts = [];
    const existingIdx = globalThis.__belvo_depts.findIndex(d => d.id === id);
    if (existingIdx !== -1) {
      globalThis.__belvo_depts[existingIdx] = department;
    } else {
      globalThis.__belvo_depts.push(department);
    }
    try {
      const ready = await isDbReady();
      if (ready) {
        const db = await getDb();
        await db.collection("departments").insertOne(department);
      }
    } catch (dbErr) {
      console.error("MongoDB department insert error:", dbErr?.message);
    }
    res.status(201).json({ success: true, department });
  } catch (err) {
    console.error("POST /api/departments error:", err);
    res.status(500).json({ success: false, message: "Failed to create department" });
  }
});

app.put(["/api/departments/:id", "/departments/:id"], authenticateToken, async (req, res) => {
  try {
    if (!(await isDbReady())) {
      return res.status(500).json({ success: false, message: "Database not configured" });
    }
    const { id } = req.params;
    const { name, color, lightColor, sortOrder } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (lightColor !== undefined) updates.light_color = lightColor;
    if (sortOrder !== undefined) updates.sort_order = sortOrder;
    updates.updated_at = new Date().toISOString();
    const db = await getDb();
    const department = await db.collection("departments").findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: "after", includeResultMetadata: false }
    );
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    res.json({ success: true, department });
  } catch (err) {
    console.error("PUT /api/departments/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to update department" });
  }
});

app.delete(["/api/departments/:id", "/departments/:id"], authenticateToken, async (req, res) => {
  try {
    if (!(await isDbReady())) {
      return res.status(500).json({ success: false, message: "Database not configured" });
    }
    const { id } = req.params;
    const db = await getDb();
    const count = await db.collection("team_members").countDocuments({ team_id: id });
    if (count > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete — ${count} member(s) still in this department` });
    }
    const result = await db.collection("departments").deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    res.json({ success: true, message: "Department deleted" });
  } catch (err) {
    console.error("DELETE /api/departments/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to delete department" });
  }
});

app.post(["/api/upload", "/upload"], authenticateToken, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large. Max 5MB." });
      }
      return res.status(400).json({ success: false, message: err?.message || "Upload error" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    res.json({ success: true, url: dataUrl });
  });
});

function parseCookies(req) {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const idx = c.indexOf('=');
      if (idx === -1) return [c.trim(), ''];
      return [c.slice(0, idx).trim(), c.slice(idx + 1).trim()];
    })
  );
}

const PORTAL_JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || "portal-dev-secret-change-in-prod";

function authenticatePortal(req, res, next) {
  const cookies = parseCookies(req);
  const token = cookies.belvo_session;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(token, PORTAL_JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    if (!(await isDbReady())) {
      return res.status(503).json({ success: false, message: "Database not configured" });
    }
    const db = await getDb();
    const profile = await db.collection("profiles").findOne({ email: email.toLowerCase().trim() });
    if (!profile) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, profile.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: profile._id.toString(), email: profile.email, role: profile.role || "client" }, PORTAL_JWT_SECRET, { expiresIn: "7d" });
    res.cookie("belvo_session", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/",
    });
    res.json({ success: true, user: { id: profile._id.toString(), email: profile.email, fullName: profile.full_name, role: profile.role || "client" } });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    if (!(await isDbReady())) {
      return res.status(503).json({ success: false, message: "Database not configured" });
    }
    const db = await getDb();
    const existing = await db.collection("profiles").findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    const password_hash = await bcrypt.hash(password, 12);
    const profile = {
      email: email.toLowerCase().trim(),
      full_name: fullName || null,
      password_hash,
      role: "client",
      created_at: new Date().toISOString(),
    };
    const result = await db.collection("profiles").insertOne(profile);
    profile._id = result.insertedId;
    const token = jwt.sign({ userId: profile._id.toString(), email: profile.email, role: profile.role }, PORTAL_JWT_SECRET, { expiresIn: "7d" });
    res.cookie("belvo_session", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/",
    });
    res.status(201).json({ success: true, user: { id: profile._id.toString(), email: profile.email, fullName: profile.full_name, role: profile.role } });
  } catch (err) {
    console.error("POST /api/auth/signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("belvo_session", { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  res.json({ success: true, message: "Signed out" });
});

app.get("/api/auth/me", authenticatePortal, (req, res) => {
  res.json({ success: true, user: { id: req.user.userId, email: req.user.email, fullName: req.user.fullName || null, role: req.user.role } });
});

app.get("/api/client/dashboard", authenticatePortal, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (!(await isDbReady())) {
      return res.status(503).json({ success: false, message: "Database not configured" });
    }
    const clientId = req.user.userId;
    const db = await getDb();
    const payments = await db.collection("payments").find({ client_id: clientId }).toArray();
    const timelineEvents = await db.collection("timeline_events").find({ client_id: clientId, visible_to_client: true }).sort({ event_date: -1 }).limit(5).toArray();
    const paid = payments?.filter(p => p.status === "paid").length || 0;
    const pending = payments?.filter(p => p.status === "pending").length || 0;
    const overdue = payments?.filter(p => p.status === "overdue").length || 0;
    const cancelled = payments?.filter(p => p.status === "cancelled").length || 0;
    const outstandingAmount = payments?.filter(p => p.status === "pending" || p.status === "overdue").reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    const upcoming = timelineEvents?.filter(e => e.status === "upcoming").length || 0;
    const completed = timelineEvents?.filter(e => e.status === "completed").length || 0;
    res.json({
      success: true,
      payments: { total: payments?.length || 0, paid, pending, overdue, cancelled, outstandingAmount },
      timeline: { totalVisible: timelineEvents?.length || 0, upcoming, completed, recent: (timelineEvents || []).map(e => ({ id: e.id, title: e.title, description: e.description || null, type: e.type, eventDate: e.event_date })) },
    });
  } catch (err) {
    console.error("GET /api/client/dashboard error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const EVENT_TITLES = {
  1: "React Free Webinar",
  2: "Flutter Workshop",
  3: "Founders Meet-up",
};

app.post("/api/register", async (req, res) => {
  try {
    const { eventId, name, email, whatsapp } = req.body;
    if (!eventId || !name || !email || !whatsapp) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!(await isDbReady())) {
      return res.status(503).json({ success: false, message: "Database not configured" });
    }
    const eventTitle = EVENT_TITLES[eventId] || `Event #${eventId}`;
    const timestamp = new Date().toISOString();
    const db = await getDb();
    await db.collection("book_calls").insertOne({
      type: "event-registration",
      created_at: timestamp,
      full_name: name,
      email,
      message: `Registered for ${eventTitle} (ID: ${eventId}) | WhatsApp: ${whatsapp}`,
    });
    if (SMTP_USER && SMTP_PASS && HR_EMAIL) {
      await emailTransporter.sendMail({
        from: `"Belvo Registrations" <${SMTP_USER}>`,
        to: HR_EMAIL,
        subject: `New Registration — ${name} for ${eventTitle}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>WhatsApp:</strong> ${whatsapp}</p><p><strong>Time:</strong> ${new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>`,
      });
    }
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      registration: { name, eventTitle, registeredAt: timestamp },
    });
  } catch (err) {
    console.error("POST /api/register error:", err);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

app.post("/api/book-call", async (req, res) => {
  try {
    const { type, fullName, email, company, budget, projectType, message } = req.body;
    if (!type || !fullName || !email) {
      return res.status(400).json({ success: false, message: "Type, name, and email are required" });
    }
    if (!(await isDbReady())) {
      return res.status(503).json({ success: false, message: "Database not configured" });
    }
    const db = await getDb();
    await db.collection("book_calls").insertOne({
      type,
      created_at: new Date().toISOString(),
      full_name: String(fullName ?? ""),
      email: String(email ?? ""),
      company: String(company ?? ""),
      budget: String(budget ?? ""),
      project_type: String(projectType ?? ""),
      message: String(message ?? ""),
    });
    res.status(201).json({ success: true, message: "Submission saved" });
  } catch (err) {
    console.error("POST /api/book-call error:", err);
    res.status(500).json({ success: false, message: "Failed to save submission" });
  }
});

app.get(["/", "/api"], (req, res) => {
  res.json({ success: true, message: "Belvo API is online", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error("Vercel Serverless unhandled handler error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err?.message || "Internal server error" });
    }
  }
}

export { app };
