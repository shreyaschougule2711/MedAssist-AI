# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Python Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
# Forcing install of uvicorn and other server deps if missing
RUN pip install --no-cache-dir -r requirements.txt uvicorn gunicorn

# Copy backend source
COPY backend/ .

# Copy built frontend from Stage 1 into the static folder
COPY --from=frontend-builder /app/frontend/dist ./static

# Configure production environment
ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads
RUN mkdir -p /app/uploads

# Start the clinical AI system
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
