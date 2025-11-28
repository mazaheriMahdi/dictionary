# Multi-stage Dockerfile for Dictionary Service
# Stage 1: Build Go backend
FROM golang:1.25-alpine AS backend-builder

WORKDIR /build

# Copy go mod files
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY cmd/ ./cmd/
COPY internal/ ./internal/

# Build the server
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# Stage 2: Build React frontend
FROM node:20-alpine AS frontend-builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /build

# Copy package files and lockfile
COPY frontend/package*.json ./
COPY frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY frontend/ ./

# Build frontend (set API URL to empty for same-origin requests)
# Set base path for gateway deployment (can be overridden with build arg)
# Default to root path, but can be set to /dictionary/ for gateway
ARG VITE_BASE_PATH=/
ENV VITE_API_URL=""
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN pnpm run build

# Stage 3: Final image
FROM alpine:latest

# Install ca-certificates and wget for health checks
RUN apk --no-cache add ca-certificates tzdata wget

WORKDIR /app

# Copy backend binary
COPY --from=backend-builder /build/server .

# Copy frontend build
COPY --from=frontend-builder /build/dist ./static

# Copy dictionary file (must exist in project root)
COPY dictionary.gob .

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run server (serve static files from ./static and API from /api)
CMD ["./server", "-dict", "dictionary.gob", "-addr", ":8080", "-static", "static"]

