import * as dotenv from "dotenv";
dotenv.config();

import express from "express"; 
import type { Request, Response } from "express"; 
import cors from "cors";
import Groq from "groq-sdk";

const app = express();

// --- UPDATED CORS: Open to everything for testing ---
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Initialize Groq - Check if API key exists
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("❌ CRITICAL ERROR: GROQ_API_KEY is missing from environment variables!");
}
const groq = new Groq({ apiKey });

app.post("/api/generate", async (req: Request, res: Response) => {
  console.log(`📩 Received request for topic: ${req.body.topic}`);
  
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "No topic provided" });

    const input = topic.toLowerCase();
    const identity = "Your name is Aiva. You are a helpful AI study assistant. NEVER use '✨ Aiva' or your name as a header.";

    let systemRole = "";
    let taskInstruction = "";
    let temperature = 0.7;

    // ... (Keep your existing if/else logic for systemRole and taskInstruction)
    if (input.includes("explain") || input.includes("what is") || input.includes("how does")) {
      systemRole = identity + "You are the Concept Mentor. Use the Feynman Technique.";
      taskInstruction = `Explain concisely: "${topic}". Rules: Use '## 🎓 Deep Dive' as ONLY header.`;
      temperature = 0.4;
    } else {
      systemRole = identity + "You are a chill study partner.";
      taskInstruction = `The user says: "${topic}". Respond naturally. Max 3 sentences.`;
      temperature = 0.7; 
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemRole },
        { role: "user", content: taskInstruction }
      ],
      model: "llama-3.1-8b-instant",
      temperature: temperature,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "";
    console.log("✅ Groq responded successfully");
    res.json({ result: responseContent });

  } catch (error: any) {
    console.error("❌ BACKEND ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Aiva Command-Center Online on Port ${PORT}`);
});