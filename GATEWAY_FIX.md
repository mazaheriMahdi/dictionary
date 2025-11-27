# Quick Fix: Gateway Connection Issue

## The Problem

Your Nginx gateway configuration:
```nginx
location /dictionary/ {
    proxy_pass http://localhost:8080/;
    ...
}
```

This causes the frontend to make API calls to `/api/v1/...` instead of `/dictionary/api/v1/...`, resulting in 404 errors.

## Quick Fix (Choose One)

### Option 1: Fix Nginx Configuration (No Rebuild Needed)

Update your Nginx config to rewrite paths:

```nginx
location /dictionary/ {
    # Remove /dictionary prefix before proxying
    rewrite ^/dictionary/(.*)$ /$1 break;
    
    proxy_pass http://localhost:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Then reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Rebuild with Base Path (Recommended)

This is the proper solution for production.

**Step 1: Rebuild Docker image with base path**

```bash
docker build --build-arg VITE_BASE_PATH=/dictionary/ -t dictionary-service:latest .
```

**Step 2: Update Nginx (same as Option 1)**

```nginx
location /dictionary/ {
    rewrite ^/dictionary/(.*)$ /$1 break;
    proxy_pass http://localhost:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Step 3: Restart container**

```bash
docker-compose restart
# or
docker restart dictionary-service
```

## Testing

After applying the fix:

```bash
# Test health endpoint
curl http://your-domain/dictionary/health

# Test API
curl http://your-domain/dictionary/api/v1/stats

# Test frontend
curl http://your-domain/dictionary/
```

All should return successfully.

## Complete Nginx Configuration

Here's the complete configuration you should use:

```nginx
location /dictionary/ {
    # Remove /dictionary prefix
    rewrite ^/dictionary/(.*)$ /$1 break;
    
    # Proxy to backend
    proxy_pass http://localhost:8080/;
    
    # Headers
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

**Important:** The `rewrite` line is crucial - it removes the `/dictionary/` prefix before sending the request to the backend.

