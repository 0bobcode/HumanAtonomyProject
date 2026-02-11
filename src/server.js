import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Vite default origin
app.use(cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Express 5: don't use "*" here
// app.options("/*", cors());

app.use(express.json());

// If you're only doing API in dev, you can skip serving build entirely.
// (Serving build is for production builds.)
console.log("OPENAI_API_KEY present?", !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/ask-organ", async (req, res) => {
    const { organ, question } = req.body;
    if (!organ || !question) {
        return res.status(400).json({ error: "Missing organ or question" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const stream = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 400,
            stream: true,
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert anatomist and science educator inside an interactive human anatomy app. Answer questions in a friendly, engaging, concise way (2-4 sentences max). Use plain language suitable for curious learners of all ages. Do not use markdown.",
                },
                {
                    role: "user",
                    content: `The user is currently viewing the ${organ}. Their question: ${question}`,
                },
            ],
        });

        for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }

        res.write("data: [DONE]\n\n");
        res.end();
    } catch (err) {
        console.error(err);
        res.write(`data: ${JSON.stringify({ error: "AI error: " + err.message })}\n\n`);
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});
