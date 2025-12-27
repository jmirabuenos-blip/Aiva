import "dotenv/config"; // Must be at the very top to load .env locally
import express from "express"; 
import type { Request, Response } from "express"; 
import cors from "cors";
import Groq from "groq-sdk";

const app = express();

// --- Middleware ---
app.use(cors({
  origin: "*", // Allows your portfolio website to call this API
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// --- Groq Initialization ---
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error("❌ CRITICAL ERROR: GROQ_API_KEY is missing from environment!");
} else {
  // Helpful for debugging Render logs without exposing the full key
  console.log("🔑 API Key detected (Prefix:", apiKey.substring(0, 4) + "...)");
}

const groq = new Groq({ apiKey });

// --- AI Generate Route ---
app.post("/api/generate", async (req: Request, res: Response) => {
  console.log(`📩 Received request for topic: ${req.body.topic}`);
  
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    const input = topic.toLowerCase();
    const identity = "Your name is Aiva. You are a helpful AI study assistant. NEVER use '✨ Aiva' or your name as a header. ";

    let systemRole = "";
    let taskInstruction = "";
    let temperature = 0.7;

    // Logic for Concept Mentor vs Chill Partner
    if (input.includes("explain") || input.includes("what is") || input.includes("how does")) {
      systemRole = identity + "You are the Concept Mentor. Use the Feynman Technique to explain complex topics simply.";
      taskInstruction = `Explain concisely: "${topic}". Rules: Use '## 🎓 Deep Dive' as your ONLY header.`;
      temperature = 0.4;
    } else {
      systemRole = identity + "You are a chill study partner.";
      taskInstruction = `The user says: "${topic}". Respond naturally and helpfully. Max 3 sentences.`;
      temperature = 0.7; 
    }

    // Fixed the TypeScript Overload error using 'as const'
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system" as const, 
          content: systemRole 
        },
        { 
          role: "user" as const, 
          content: taskInstruction 
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: temperature,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "";
    console.log("✅ Groq responded successfully");
    
    res.json({ result: responseContent });

  } catch (error: any) {
    console.error("❌ BACKEND ERROR:", error.message);
    res.status(error.status || 500).json({ 
      error: error.message,
      details: "Check API Key configuration if status is 401"
    });
  }
});

// --- Health Check (Used by Render to monitor uptime) ---
app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).send("ok");
});

// --- Server Startup ---
// Render automatically provides a PORT environment variable. 
// Locally, it will fall back to 5000.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Aiva Command-Center Online on Port ${PORT}`);
});