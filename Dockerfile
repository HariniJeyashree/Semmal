# Stage 1: Build Next.js Static Export
FROM node:20-alpine AS builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Build Next.js. With output: 'export' in next.config.ts, this generates the /out directory.
RUN npm run build

# Stage 2: Backend & Runtime Server
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for vector databases (ChromaDB) and Postgres
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ ./

# Copy the static Next.js build output into a 'static' folder for FastAPI to serve
COPY --from=builder /app/frontend/out ./static

# Expose Hugging Face standard port
EXPOSE 7860

# Run FastAPI app on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
