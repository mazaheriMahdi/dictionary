# Docker Deployment Guide

This guide explains how to build and run the Dictionary Service as a Docker container.

## Prerequisites

- Docker installed on your system
- `dictionary.gob` file in the project root

## Quick Start

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t dictionary-service .

# Run the container
docker run -d -p 8080:8080 --name dictionary dictionary-service
```

The application will be available at `http://localhost:8080`

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Dockerfile Details

The Dockerfile uses a multi-stage build:

1. **Backend Builder**: Compiles the Go server
2. **Frontend Builder**: Builds the React frontend
3. **Final Image**: Alpine Linux with the compiled binary, static files, and dictionary

### Image Size

The final image is optimized for size:
- Base: Alpine Linux (~5MB)
- Go binary: ~10-15MB
- Frontend build: ~200KB (gzipped)
- Dictionary file: Depends on your data
- **Total**: ~20-30MB + dictionary size

## Configuration

### Environment Variables

You can set environment variables in `docker-compose.yml`:

```yaml
environment:
  - TZ=UTC
```

### Port Mapping

Change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "YOUR_PORT:8080"
```

### Dictionary File

The `dictionary.gob` file must be in the project root. It will be copied into the image during build.

To update the dictionary without rebuilding:
```yaml
volumes:
  - ./dictionary.gob:/app/dictionary.gob:ro
```

## Building

### Build Options

```bash
# Standard build
docker build -t dictionary-service .

# Build with custom tag
docker build -t dictionary-service:v1.0.0 .

# Build without cache
docker build --no-cache -t dictionary-service .
```

## Running

### Basic Run

```bash
docker run -p 8080:8080 dictionary-service
```

### With Custom Port

```bash
docker run -p 3000:8080 dictionary-service
```

### With Volume Mount (for dictionary updates)

```bash
docker run -p 8080:8080 \
  -v $(pwd)/dictionary.gob:/app/dictionary.gob:ro \
  dictionary-service
```

### Background Mode

```bash
docker run -d -p 8080:8080 --name dictionary dictionary-service
```

## Health Checks

The container includes a health check that verifies the `/health` endpoint:

```bash
# Check container health
docker ps

# View health check logs
docker inspect dictionary-service | grep -A 10 Health
```

## Troubleshooting

### Container Won't Start

1. Check if port 8080 is already in use:
   ```bash
   lsof -i :8080
   ```

2. Check container logs:
   ```bash
   docker logs dictionary-service
   ```

3. Verify dictionary.gob exists:
   ```bash
   ls -lh dictionary.gob
   ```

### Frontend Not Loading

1. Check if static files are being served:
   ```bash
   curl http://localhost:8080/
   ```

2. Verify API endpoints work:
   ```bash
   curl http://localhost:8080/api/v1/stats
   ```

### CORS Errors

CORS is configured to allow:
- Same-origin requests (when frontend and backend are on same domain)
- Localhost origins for development

If you need to allow specific domains, modify `internal/server/middleware.go`.

## Production Deployment

### Security Considerations

1. **Run as non-root**: The container runs as user `appuser` (UID 1000)
2. **Read-only dictionary**: Mount dictionary as read-only
3. **Resource limits**: Set CPU and memory limits in production

Example `docker-compose.yml` for production:

```yaml
services:
  dictionary:
    build: .
    ports:
      - "8080:8080"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    restart: always
    security_opt:
      - no-new-privileges:true
```

### Reverse Proxy

For production, use a reverse proxy (nginx, Traefik, etc.):

```nginx
server {
    listen 80;
    server_name dictionary.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Updating

### Rebuild After Code Changes

```bash
# Stop container
docker-compose down

# Rebuild
docker-compose build

# Start
docker-compose up -d
```

### Update Dictionary Only

If using volume mount:
```bash
# Replace dictionary.gob file
cp new-dictionary.gob dictionary.gob

# Restart container
docker-compose restart
```

## Monitoring

### View Logs

```bash
# All logs
docker logs dictionary-service

# Follow logs
docker logs -f dictionary-service

# Last 100 lines
docker logs --tail 100 dictionary-service
```

### Container Stats

```bash
docker stats dictionary-service
```

## Cleanup

```bash
# Stop and remove container
docker-compose down

# Remove image
docker rmi dictionary-service

# Remove all unused images
docker image prune -a
```

