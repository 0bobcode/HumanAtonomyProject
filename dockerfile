FROM node:20-bookworm-slim

WORKDIR /app

# System deps (zstd is required by Ollama installer)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates bash zstd \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | bash

# Install Node deps
COPY package*.json ./
RUN npm install

# Copy project
COPY . .

# Expose both backend + Vite dev server
EXPOSE 3001
EXPOSE 5174

ENV PORT=3001
ENV OLLAMA_MODEL=llama3

CMD ["bash", "-lc", "\
    echo 'Starting Ollama...' && \
    ollama serve > /tmp/ollama.log 2>&1 & \
    for i in {1..60}; do curl -s http://127.0.0.1:11434/api/tags >/dev/null && break || sleep 1; done && \
    echo 'Pulling model...' && \
    ollama pull ${OLLAMA_MODEL} && \
    echo 'Starting backend...' && \
    node src/server.js & \
    echo 'Starting Vite dev server...' && \
    npm run dev -- --host 0.0.0.0 --port 5174 \
    "]
