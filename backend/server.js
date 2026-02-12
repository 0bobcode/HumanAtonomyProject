import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3001;

// In Docker Compose we’ll set this to http://ollama:11434
// In local dev you can leave it as http://localhost:11434
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

// Security & perf
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "64kb" }));

// If frontend is served separately, set FRONTEND_ORIGIN.
// If you serve both behind one domain, you can disable cors or keep it permissive.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.use(
    cors({
        origin: FRONTEND_ORIGIN ? [FRONTEND_ORIGIN] : true,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Basic rate limit (tweak as you like)
app.use(
    rateLimit({
        windowMs: 60_000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/ask-organ", async (req, res) => {
    const { organ, question } = req.body || {};
    if (!organ || !question) {
        return res.status(400).json({ error: "Missing organ or question" });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // helps if behind nginx
    res.flushHeaders?.();

    const prompt = [
        "You are an expert anatomist and science educator inside an interactive human anatomy app.",
        "Answer in a friendly, engaging, concise way (2-4 sentences max).",
        "Use plain language suitable for curious learners of all ages.",
        "Do not use markdown.",
        "",
        `The user is currently viewing the ${organ}.`,
        `Their question: ${question}`,
    ].join("\n");

    const abort = new AbortController();
    req.on("close", () => abort.abort());

    try {
        const ollamaRes = await fetch(`${OLLAMA_HOST}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: abort.signal,
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: true,
                options: {
                    temperature: 0.5,
                    num_predict: 220,
                },
            }),
        });

        if (!ollamaRes.ok || !ollamaRes.body) {
            const txt = await ollamaRes.text().catch(() => "");
            res.write(`data: ${JSON.stringify({ error: `Ollama error (${ollamaRes.status}): ${txt || "no body"}` })}\n\n`);
            res.write("data: [DONE]\n\n");
            return res.end();
        }

        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                // Ollama streams JSON per line: {"response":"...", "done":false}
                try {
                    const json = JSON.parse(trimmed);
                    if (json.response) {
                        res.write(`data: ${JSON.stringify({ text: json.response })}\n\n`);
                    }
                    if (json.done) {
                        res.write("data: [DONE]\n\n");
                        res.end();
                        return;
                    }
                } catch {
                    // ignore partial/garbage lines
                }
            }
        }

        res.write("data: [DONE]\n\n");
        res.end();
    } catch (err) {
        const msg = err?.name === "AbortError" ? "Client disconnected" : (err?.message || "Unknown error");
        res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Using Ollama at: ${OLLAMA_HOST} (model: ${OLLAMA_MODEL})`);
});
