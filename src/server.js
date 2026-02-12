import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.post("/api/ask-organ", async (req, res) => {
    const { organ, question } = req.body;

    if (!organ || !question) {
        return res.status(400).json({ error: "Missing organ or question" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3",
                stream: true,
                prompt: `You are an expert anatomist inside an anatomy app. Answer clearly and concisely in 2-4 sentences.

The user is viewing the ${organ}.
Question: ${question}`,
            }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value).split("\n");

            for (const line of lines) {
                if (!line.trim()) continue;
                const data = JSON.parse(line);

                if (data.response) {
                    res.write(`data: ${JSON.stringify({ text: data.response })}\n\n`);
                }

                if (data.done) {
                    res.write("data: [DONE]\n\n");
                    res.end();
                    return;
                }
            }
        }
    } catch (err) {
        console.error(err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`✅ FREE AI running at http://localhost:${PORT}`);
});
