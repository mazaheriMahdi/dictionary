# Production Deployment Guide

This comprehensive guide covers everything you need to know about building the dictionary `.gob` file and deploying the Dictionary Service to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Building the Dictionary File](#building-the-dictionary-file)
3. [Building the Docker Image](#building-the-docker-image)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Prerequisites

Before you begin, ensure you have:

- **Go 1.25+** installed (for building the converter)
- **Docker** and **Docker Compose** installed
- **Your dictionary JSON file** with the following structure:
  ```json
  {
    "TotalUniqueWords": 910723,
    "Words": [
      {
        "EnglishWord": "hello",
        "Meanings": ["سلام", "درود"]
      }
    ]
  }
  ```

## Building the Dictionary File

### Step 1: Prepare Your JSON Dictionary

Ensure your JSON file follows the correct schema:

```json
{
  "TotalUniqueWords": <number>,
  "Words": [
    {
      "EnglishWord": "<word>",
      "Meanings": ["<meaning1>", "<meaning2>", ...]
    }
  ]
}
```

**File naming convention:**
- Input: `dictionary.json` (or any name you prefer)
- Output: `dictionary.gob` (will be created)

### Step 2: Convert JSON to GOB Format

#### Option A: Using Go Run (Recommended for Development)

```bash
# From the project root directory
go run cmd/convert/main.go dictionary.json dictionary.gob
```

#### Option B: Build the Converter Binary

```bash
# Build the converter
go build -o convert cmd/convert/main.go

# Run the converter
./convert dictionary.json dictionary.gob
```

#### Option C: Using Docker (No Go Installation Required)

```bash
# Build converter image
docker build -f Dockerfile.converter -t dict-converter .

# Run conversion
docker run --rm -v $(pwd):/data dict-converter \
  dictionary.json dictionary.gob
```

### Step 3: Verify the GOB File

After conversion, verify the file was created:

```bash
# Check file exists and size
ls -lh dictionary.gob

# Expected output (example):
# -rw-r--r-- 1 user user 41M Nov 28 01:46 dictionary.gob
```

**Expected file size:**
- Original JSON: ~100-200MB (uncompressed)
- GOB file: ~40-60MB (compressed with gzip)
- Compression ratio: Typically 60-80% reduction

### Step 4: Test the GOB File

Before deploying, test that the GOB file works:

```bash
# Test loading with CLI
go run main.go -dict dictionary.gob hello

# Or test with server
go run cmd/server/main.go -dict dictionary.gob -addr :8080
# Then visit http://localhost:8080/api/v1/stats
```

## Building the Docker Image

### Step 1: Ensure Dictionary File is in Place

The `dictionary.gob` file **must** be in the project root directory:

```bash
# Verify location
ls -lh dictionary.gob
# Should show: dictionary.gob in current directory
```

### Step 2: Build the Docker Image

#### Option A: Using Docker Build

```bash
# Standard build
docker build -t dictionary-service:latest .

# Build with specific tag
docker build -t dictionary-service:v1.0.0 .

# Build with no cache (clean build)
docker build --no-cache -t dictionary-service:latest .
```

#### Option B: Using Build Script

```bash
# Make script executable (first time only)
chmod +x build-docker.sh

# Run build script
./build-docker.sh
```

#### Option C: Using Docker Compose

```bash
# Build with docker-compose
docker-compose build

# Build without cache
docker-compose build --no-cache
```

### Step 3: Verify the Image

```bash
# List images
docker images | grep dictionary-service

# Inspect image size
docker images dictionary-service

# Expected size: ~50-70MB (base) + dictionary size
```

### Step 4: Test the Image Locally

Before deploying to production, test locally:

```bash
# Run container
docker run -d -p 8080:8080 --name dictionary-test dictionary-service:latest

# Check logs
docker logs dictionary-test

# Test endpoints
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/stats

# Stop and remove test container
docker stop dictionary-test
docker rm dictionary-test
```

## Production Deployment

### Deployment Options

#### Option 1: Docker Compose (Recommended for Single Server)

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  dictionary:
    image: dictionary-service:latest
    container_name: dictionary-service-prod
    ports:
      - "8080:8080"
    volumes:
      - ./dictionary.gob:/app/dictionary.gob:ro
    environment:
      - TZ=UTC
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Deploy:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: Docker Run (Simple Deployment)

```bash
docker run -d \
  --name dictionary-service \
  --restart unless-stopped \
  -p 8080:8080 \
  -v $(pwd)/dictionary.gob:/app/dictionary.gob:ro \
  dictionary-service:latest
```

#### Option 3: Kubernetes Deployment

**k8s-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dictionary-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dictionary-service
  template:
    metadata:
      labels:
        app: dictionary-service
    spec:
      containers:
      - name: dictionary
        image: dictionary-service:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: dictionary-service
spec:
  selector:
    app: dictionary-service
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

**Deploy:**
```bash
kubectl apply -f k8s-deployment.yaml
```

### Step 5: Set Up Reverse Proxy (Production)

For production, use a reverse proxy (Nginx, Traefik, etc.):

#### Nginx Configuration

**Option A: Subdomain (Recommended)**

**/etc/nginx/sites-available/dictionary:**
```nginx
server {
    listen 80;
    server_name dictionary.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dictionary.example.com;

    ssl_certificate /etc/letsencrypt/live/dictionary.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dictionary.example.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Option B: Path Prefix (e.g., /dictionary/)**

If you need to deploy under a path prefix, see [NGINX_GATEWAY.md](NGINX_GATEWAY.md) for complete instructions.

**Quick configuration:**
```nginx
location /dictionary/ {
    # Remove /dictionary prefix before proxying
    rewrite ^/dictionary/(.*)$ /$1 break;
    
    proxy_pass http://localhost:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**Important:** When using path prefix, rebuild Docker image with:
```bash
docker build --build-arg VITE_BASE_PATH=/dictionary/ -t dictionary-service:latest .
```

## Configuration

### Environment Variables

Set these in your deployment:

```bash
# Timezone
TZ=UTC

# Optional: Custom dictionary path (default: dictionary.gob)
DICT_PATH=/app/dictionary.gob

# Optional: Custom port (default: 8080)
PORT=8080
```

### Resource Limits

Recommended production resource limits:

```yaml
resources:
  limits:
    cpus: '2'        # Adjust based on load
    memory: 1G       # Minimum 512M, recommended 1G
  reservations:
    cpus: '0.5'
    memory: 512M
```

**Memory Requirements:**
- Base application: ~50MB
- Dictionary in memory: ~200-400MB (depends on dictionary size)
- Buffer: ~200MB
- **Total recommended: 1GB**

### Port Configuration

Default port is `8080`. To change:

```bash
# Docker run
docker run -p 3000:8080 dictionary-service:latest

# Docker Compose
ports:
  - "3000:8080"
```

## Monitoring and Maintenance

### Health Checks

The container includes automatic health checks:

```bash
# Check health status
docker ps

# Manual health check
curl http://localhost:8080/health
```

### Logging

#### View Logs

```bash
# Docker logs
docker logs dictionary-service

# Follow logs
docker logs -f dictionary-service

# Last 100 lines
docker logs --tail 100 dictionary-service

# With timestamps
docker logs -t dictionary-service
```

#### Log Rotation

Configure in `docker-compose.yml`:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Monitoring Endpoints

```bash
# Health check
curl http://localhost:8080/health

# Statistics
curl http://localhost:8080/api/v1/stats

# Performance monitoring
docker stats dictionary-service
```

### Updating the Dictionary

#### Method 1: Rebuild Image (Recommended for Large Updates)

```bash
# 1. Update dictionary.gob file
go run cmd/convert/main.go new-dictionary.json dictionary.gob

# 2. Rebuild image
docker build -t dictionary-service:latest .

# 3. Restart container
docker-compose restart
# or
docker restart dictionary-service
```

#### Method 2: Volume Mount (Quick Updates)

```yaml
volumes:
  - ./dictionary.gob:/app/dictionary.gob:ro
```

Then:
```bash
# 1. Update dictionary.gob
go run cmd/convert/main.go new-dictionary.json dictionary.gob

# 2. Restart container (will load new file)
docker-compose restart
```

### Backup Strategy

```bash
# Backup dictionary file
cp dictionary.gob dictionary.gob.backup-$(date +%Y%m%d)

# Backup Docker image
docker save dictionary-service:latest | gzip > dictionary-service-backup.tar.gz

# Restore
docker load < dictionary-service-backup.tar.gz
```

## Troubleshooting

### Common Issues

#### 1. Dictionary File Not Found

**Error:**
```
Failed to load dictionary: failed to open dictionary file: open dictionary.gob: no such file or directory
```

**Solution:**
```bash
# Verify file exists
ls -lh dictionary.gob

# Check file is in correct location (project root)
pwd
# Should be in dictionary-service directory

# Rebuild if file was added after image build
docker build -t dictionary-service:latest .
```

#### 2. Port Already in Use

**Error:**
```
bind: address already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :8080
# or
netstat -tulpn | grep 8080

# Kill process or use different port
docker run -p 8082:8080 dictionary-service:latest
```

#### 3. Out of Memory

**Error:**
```
Container killed (OOM)
```

**Solution:**
```bash
# Increase memory limit
docker run -m 2g -p 8080:8080 dictionary-service:latest

# Or in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
```

#### 4. CORS Errors in Browser

**Error:**
```
Access to fetch at 'http://...' from origin 'http://...' has been blocked by CORS policy
```

**Solution:**
- If frontend and backend are on same domain (Docker): Should work automatically
- If different domains: Update CORS middleware in `internal/server/middleware.go`

#### 5. Frontend Not Loading

**Error:**
```
404 Not Found for static files
```

**Solution:**
```bash
# Verify static files exist in image
docker run --rm dictionary-service:latest ls -la /app/static

# Check server logs
docker logs dictionary-service

# Verify static directory is set correctly
docker run --rm dictionary-service:latest ./server -static static
```

### Debugging

#### Enter Container

```bash
# Execute command in running container
docker exec -it dictionary-service sh

# Or run new container with shell
docker run -it --rm dictionary-service:latest sh
```

#### Check File Contents

```bash
# List files in container
docker run --rm dictionary-service:latest ls -la /app

# Check dictionary file size
docker run --rm dictionary-service:latest ls -lh /app/dictionary.gob
```

#### Test API Endpoints

```bash
# Health check
curl http://localhost:8080/health

# Stats
curl http://localhost:8080/api/v1/stats

# Word lookup
curl http://localhost:8080/api/v1/words/hello

# Suggestions
curl http://localhost:8080/api/v1/suggest/hel
```

## Best Practices

### 1. Version Control

- **DO**: Commit `dictionary.gob` to version control (if size allows)
- **DO**: Tag Docker images with version numbers
- **DON'T**: Commit large temporary files

### 2. Security

- **DO**: Run container as non-root user (already configured)
- **DO**: Use read-only mounts for dictionary file
- **DO**: Set resource limits
- **DO**: Use HTTPS in production (via reverse proxy)
- **DON'T**: Expose port 8080 directly to internet

### 3. Performance

- **DO**: Set appropriate memory limits
- **DO**: Use health checks
- **DO**: Monitor resource usage
- **DO**: Use connection pooling if behind load balancer

### 4. Maintenance

- **DO**: Regular backups of dictionary file
- **DO**: Monitor logs for errors
- **DO**: Update dictionary regularly
- **DO**: Test updates in staging first

### 5. Deployment Checklist

Before going to production:

- [ ] Dictionary file converted and tested
- [ ] Docker image built and tested locally
- [ ] Health checks working
- [ ] Resource limits configured
- [ ] Reverse proxy configured (if needed)
- [ ] SSL/TLS certificates installed
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Logging configured
- [ ] Documentation updated

## Quick Reference

### Build Dictionary

```bash
go run cmd/convert/main.go dictionary.json dictionary.gob
```

### Build Docker Image

```bash
docker build -t dictionary-service:latest .
```

### Run Container

```bash
docker run -d -p 8080:8080 --name dictionary dictionary-service:latest
```

### Update Dictionary

```bash
# 1. Convert new dictionary
go run cmd/convert/main.go new-dictionary.json dictionary.gob

# 2. Rebuild or restart
docker build -t dictionary-service:latest .
docker-compose restart
```

### Check Status

```bash
# Container status
docker ps | grep dictionary

# Health check
curl http://localhost:8080/health

# Statistics
curl http://localhost:8080/api/v1/stats
```

## Support

For issues or questions:
1. Check [DOCKER.md](DOCKER.md) for Docker-specific issues
2. Check [README.md](README.md) for general usage
3. Review logs: `docker logs dictionary-service`
4. Check health endpoint: `curl http://localhost:8080/health`

