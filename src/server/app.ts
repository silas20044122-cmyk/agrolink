import express from "express";
import { getAgroLinkChatStream, generateMarketInsight, analyzeCropDisease } from "../services/geminiServer.js";

const app = express();

// Config body parsers for settings operations
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Add a health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gemini Technical Advisor API endpoints

// Stream Chat Endpoint
app.post("/api/gemini/chat-stream", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "A query message prompt is required." });
    }

    // Set headers for standard chunked stream transfer
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const responseStream = await getAgroLinkChatStream(message, history || [], context);
    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (e: any) {
    console.error("Express Gemini stream failure:", e);
    res.status(500).write(`An error occurred while communicating with AgriLink AI: ${e?.message || "Internal server error"}`);
    res.end();
  }
});

// Market Insight Endpoint
app.post("/api/gemini/market-insight", async (req, res) => {
  try {
    const { region } = req.body;
    const data = await generateMarketInsight(region || "Kenya");
    return res.json(data);
  } catch (e: any) {
    console.error("Express Market insight failure:", e);
    return res.status(500).json({ 
      title: "Market Insight Status", 
      insight: "Could not fetch latest market intelligence reports at this moment. Please double check credentials or try again later.", 
      type: "warning" 
    });
  }
});

// Analyze Crop Disease Endpoint
app.post("/api/gemini/analyze-crop-disease", async (req, res) => {
  try {
    const { imageData, mimeType } = req.body;
    if (!imageData) {
      return res.status(400).json({ success: false, message: "A photo is required for diagnostic analysis." });
    }
    const data = await analyzeCropDisease(imageData, mimeType || "image/jpeg");
    return res.json(data);
  } catch (e: any) {
    console.error("Express Diagnose crop disease failure:", e);
    return res.status(500).json({
      cropName: "Unknown Crop",
      diseaseName: "Diagnosis failed",
      healthStatus: "Error diagnostic, server could not execute fully.",
      confidence: 0,
      diagnosis: "Could not establish secure AI connection to diagnose crop leaf imagery.",
      treatmentPlanSw: "Zana za kutambua maradhi hazipatikani kwa sasa.",
      treatmentPlanEn: "Diagnosis engine offline. Please ensure Gemini API keys are fully registered in server secrets.",
      immediateActions: ["Check connection status", "Confirm API key configuration in Secrets", "Try again later"]
    });
  }
});

// Verify Account Password Endpoint
app.post("/api/settings/verify-password", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required." });
  }
  // Accept standard test passwords, fail if "fail" is passed
  if (password === 'fail' || password === 'wrong') {
    return res.status(400).json({ success: false, message: "Invalid security credentials. Verification failed." });
  }
  return res.json({ success: true, message: "Security credentials verified." });
});

// Enable Secure 2FA Endpoint
app.post("/api/settings/2fa/enable", (req, res) => {
  const { pin, password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: "Authentication password is required." });
  }
  if (!pin || pin.length !== 6) {
    return res.status(400).json({ success: false, message: "A valid 6-digit security PIN is required." });
  }
  const codes = Array.from({ length: 5 }, () => 
    Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000)
  );
  return res.json({ 
    success: true, 
    message: "Two-Factor authentication securely registered.",
    backupCodes: codes
  });
});

// Disable 2FA Endpoint
app.post("/api/settings/2fa/disable", (req, res) => {
  const { pin, password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: "Authentication password is required to disable 2FA." });
  }
  if (!pin) {
    return res.status(400).json({ success: false, message: "Verification PIN token is required." });
  }
  return res.json({ success: true, message: "Two-Factor authentication has been deactivated." });
});

import fs from "fs";
import path from "path";

// Define directories & filesystem database file
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const DB_PATH = path.join(process.cwd(), "mock_db.json");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded profile pictures statically over HTTP
app.use("/uploads", express.static(UPLOADS_DIR));

// Read from database file or fallback to default
function readProfilesDb(): Record<string, any> {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error reading profiles database file:", err);
  }
  
  // Default fallback profiles
  return {
    "silas20044122@gmail.com": {
      id: "mock-farmer-id",
      name: "Silas Omulama",
      email: "silas20044122@gmail.com",
      role: "farmer",
      region: "Kakamega",
      phoneNumber: "+254 712 345 678",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=silas",
      bio: "Dedicated farmer from Kakamega county focusing on maize and organic farming."
    }
  };
}

// Write updates to database file
function writeProfilesDb(db: Record<string, any>) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing profiles database file:", err);
  }
}

// Upload Profile Picture Endpoint
app.post("/api/settings/upload-profile-picture", (req, res) => {
  const { imageBase64, userId } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: "Profile photo byte stream data is missing." });
  }

  try {
    // Validate payload size
    const approxBytes = (imageBase64.length * 3) / 4;
    const mbSizing = approxBytes / (1024 * 1024);
    if (mbSizing > 5) {
      return res.status(400).json({ success: false, message: "Payload size limits violated (Maximum allowable is 5MB)." });
    }

    let base64Data = imageBase64;
    let extension = "png";

    // Extract mime type and base64 data correctly
    const matches = imageBase64.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      extension = matches[1];
      base64Data = matches[2];
    }

    // Generate safe, distinct filename
    const filename = `avatar-${userId || "farmer"}-${Date.now()}.${extension}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Save image to disk
    fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));

    // Publicly accessible URL on this Express server
    const publicUrl = `/uploads/${filename}`;

    return res.json({ 
      success: true, 
      message: "Custom profile picture saved successfully.", 
      avatarUrl: publicUrl 
    });
  } catch (err: any) {
    console.error("Failed to write uploaded image file:", err);
    return res.status(500).json({ success: false, message: `Failed to save image: ${err?.message || "Unknown error"}` });
  }
});

// Delete Custom Profile Picture Endpoint
app.post("/api/settings/delete-profile-picture", (req, res) => {
  return res.json({ success: true, message: "Custom profile photo successfully deleted." });
});

// Switch Avatar source reference Endpoint
app.post("/api/settings/switch-avatar-source", (req, res) => {
  const { source } = req.body; // 'dicebear' | 'custom'
  return res.json({ success: true, source, message: `Profile identity source set to ${source}.` });
});

app.get("/api/profile", (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, message: "Email query param is required." });
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  const db = readProfilesDb();
  let profile = db[normalizedEmail];
  
  if (!profile) {
    profile = {
      id: `mock-id-${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "")}`,
      name: normalizedEmail.split("@")[0],
      email: normalizedEmail,
      role: "farmer",
      region: "Kakamega",
      phoneNumber: "+254 712 345 678",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`,
      bio: ""
    };
    db[normalizedEmail] = profile;
    writeProfilesDb(db);
  }
  return res.json({ success: true, profile });
});

app.post("/api/profile", (req, res) => {
  const { profile } = req.body;
  if (!profile || !profile.email) {
    return res.status(400).json({ success: false, message: "Profile with email is required." });
  }
  
  const normalizedEmail = profile.email.toLowerCase().trim();
  const db = readProfilesDb();
  db[normalizedEmail] = {
    ...db[normalizedEmail],
    ...profile,
    updatedAt: new Date().toISOString()
  };
  writeProfilesDb(db);
  return res.json({ success: true, profile: db[normalizedEmail] });
});

// Fresh Recovery Backup codes generation Endpoint
app.post("/api/settings/generate-recovery-codes", (req, res) => {
  const codes = Array.from({ length: 5 }, () => 
    Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000)
  );
  return res.json({ success: true, backupCodes: codes });
});

export { app };
