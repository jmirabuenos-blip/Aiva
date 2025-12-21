import * as dotenv from "dotenv";
dotenv.config();

import express from "express"; 
import type { Request, Response } from "express"; 
import cors from "cors";
import Groq from "groq-sdk";

const app = express();

// --- DEPLOYMENT FIX 1: CORS ---
// During development, we use localhost:3000. 
// Once deployed, you can change this to your Vercel URL or use "*" to allow all (less secure but easier).
app.use(cors()); 

app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/api/generate", async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    const input = topic.toLowerCase();

    const identity = "Your name is Aiva. You are a helpful AI study assistant. You are talking to a human student. NEVER use '✨ Aiva' or your name as a header. ";

    let systemRole = "";
    let taskInstruction = "";
    let temperature = 0.7;

    if (input.includes("explain") || input.includes("what is") || input.includes("how does")) {
      systemRole = identity + "You are the Concept Mentor. Use the Feynman Technique.";
      taskInstruction = `Explain concisely to the user: "${topic}". Rules: Use '## 🎓 Deep Dive' as the ONLY header. Bold key terms and end with a '### 💡 Analogy'.`;
      temperature = 0.4;
    } 
    else if (input.includes("quiz") || input.includes("test me") || input.includes("practice")) {
      systemRole = identity + "You are the Quiz Master.";
      taskInstruction = `Generate a 5-question multiple choice quiz about: "${topic}". Use '## 📝 Challenge Mode' as the ONLY header.`;
      temperature = 0.4;
    } 
    else if (input.includes("summarize") || input.includes("review") || input.includes("notes")) {
      systemRole = identity + "You are the Memory Architect.";
      taskInstruction = `Create a high-density reviewer for: "${topic}". Use '## ⚡ Quick Reviewer' as the ONLY header.`;
      temperature = 0.3;
    } 
    else {
      systemRole = identity + "You are a chill, high-EQ study partner. You respond to the human user. You are the AI, they are the human.";
      taskInstruction = `The user says: "${topic}". Respond naturally. Rules: NO HEADERS. NO 'Aiva:' prefix. Max 3 sentences.`;
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

    res.json({ result: chatCompletion.choices[0]?.message?.content || "" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- DEPLOYMENT FIX 2: PORT ---
// Render and other services inject a PORT variable. If it doesn't exist, it defaults to 5000.
const PORT = process.env.PORT || 5000;

// Adding '0.0.0.0' allows the server to be reachable outside of localhost
app.listen(PORT, () => {
  console.log(`✅ Aiva Command-Center Online on Port ${PORT}`);
});