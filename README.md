# Human Anatomy Explorer

An interactive anatomy learning application powered by a locally hosted large language model.

This project combines a modern React frontend, an Express backend, and Ollama (running Llama 3 locally) to deliver real-time, streaming AI explanations for human organs — without relying on external paid APIs.

---

## Overview

Human Anatomy Explorer is designed as an educational tool that allows users to:

- Interact with a clickable anatomical body map
- Explore organ descriptions and survival importance
- Listen to simulated physiological sounds
- Ask contextual AI-powered questions about specific organs
- Receive real-time streaming responses from a local LLM

The system runs entirely locally and can be fully containerized with Docker.

---

## Key Features

### Interactive Organ Visualization
- Clickable SVG-based human body
- Highlighted active organ
- Structured anatomical data (system, description, importance, fact)

### AI Anatomy Assistant
- Context-aware responses (knows which organ is selected)
- Streaming token-by-token output via Server-Sent Events (SSE)
- Powered by Ollama using Llama 3
- No external API keys or usage costs

### Procedural Audio Simulation
- Heartbeat synthesis
- Breathing simulation
- Brainwave tone
- Blood flow and filtration effects
- Generated dynamically using the Web Audio API

### Local AI Architecture
- Express server streams responses from Ollama
- Frontend renders streamed tokens incrementally
- Fully offline-capable once model is downloaded

---

## Architecture

Frontend (React + Vite)
|
| POST /api/ask-organ
v
Backend (Express)
|
| POST /api/generate
v
Ollama (Llama 3 Local Model)

---

## Tech Stack

### Frontend
- React (Vite)
- SVG for body rendering
- Web Audio API for sound synthesis
- Fetch + Streaming (ReadableStream)

### Backend
- Node.js
- Express
- Server-Sent Events (SSE)

### AI
- Ollama
- Llama 3

### Containerization
- Docker
- Docker Compose

---

## Project Structure

├── backend/
│ ├── server.js
│ ├── Dockerfile
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ └── App.jsx
│ ├── Dockerfile
│ └── package.json
│
├── docker-compose.yml
└── README.md