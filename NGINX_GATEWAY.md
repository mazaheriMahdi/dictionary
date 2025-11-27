# Nginx Gateway Configuration Guide

When deploying the Dictionary Service behind a gateway with a path prefix (e.g., `/dictionary/`), you need to configure both Nginx and the frontend correctly.

## Problem

When accessing the service via `/dictionary/`, the frontend makes API calls to `/api/v1/...` instead of `/dictionary/api/v1/...`, causing 404 errors.

## Solution 1: Configure Frontend Base Path (Recommended)

This is the cleanest solution - configure the frontend to use a base path.

### Step 1: Update Vite Configuration

Update `frontend/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dictionary/',  // Add this line
})
```

### Step 2: Rebuild Frontend

```bash
cd frontend
npm run build
```

### Step 3: Rebuild Docker Image

```bash
docker build -t dictionary-service:latest .
```

### Step 4: Update Nginx Configuration

```nginx
location /dictionary/ {
    # Remove trailing slash for proxy_pass
    proxy_pass http://localhost:8080/;
    
    # Important headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Rewrite paths - remove /dictionary prefix before proxying
    rewrite ^/dictionary/(.*)$ /$1 break;
    
    # WebSocket support (if needed)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Solution 2: Nginx Path Rewriting Only

If you can't rebuild the frontend, use Nginx to rewrite paths:

### Nginx Configuration

```nginx
location /dictionary/ {
    # Proxy to backend
    proxy_pass http://localhost:8080/;
    
    # Remove /dictionary prefix from requests
    rewrite ^/dictionary/(.*)$ /$1 break;
    
    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS headers (if needed)
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    
    # Handle preflight
    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

**Note:** This solution requires the frontend to be rebuilt with the base path configuration (Solution 1) for proper routing.

## Solution 3: Subdomain Instead of Path (Alternative)

Instead of using `/dictionary/`, use a subdomain:

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name dictionary.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

This avoids path prefix issues entirely.

## Complete Nginx Configuration Example

Here's a complete example for production:

```nginx
server {
    listen 80;
    server_name example.com;

    # Dictionary service
    location /dictionary/ {
        # Remove trailing slash and rewrite path
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
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # Don't proxy these
        proxy_redirect off;
    }
    
    # Health check (optional - direct access)
    location /dictionary/health {
        proxy_pass http://localhost:8080/health;
        access_log off;
    }
}
```

## Testing

After configuration:

1. **Test static files:**
   ```bash
   curl http://your-domain/dictionary/
   # Should return the React app HTML
   ```

2. **Test API endpoint:**
   ```bash
   curl http://your-domain/dictionary/api/v1/stats
   # Should return JSON with word count
   ```

3. **Test health check:**
   ```bash
   curl http://your-domain/dictionary/health
   # Should return {"status":"healthy"}
   ```

4. **Check browser console:**
   - Open browser DevTools
   - Check Network tab
   - Verify API calls go to `/dictionary/api/v1/...`
   - No 404 errors

## Troubleshooting

### Issue: 404 on API calls

**Problem:** API calls return 404

**Solution:**
- Verify Nginx rewrite rule is correct
- Check that frontend is built with base path
- Verify proxy_pass doesn't have trailing slash issues

### Issue: Static files not loading

**Problem:** CSS/JS files return 404

**Solution:**
- Ensure Vite base path is set to `/dictionary/`
- Rebuild frontend: `cd frontend && npm run build`
- Rebuild Docker image

### Issue: CORS errors

**Problem:** Browser shows CORS errors

**Solution:**
- Since frontend and backend are on same origin via proxy, CORS shouldn't be needed
- If errors persist, check Nginx CORS headers in config above

### Issue: React Router not working

**Problem:** Direct URLs return 404

**Solution:**
- Ensure SPA fallback is configured in Go server (already done)
- Verify Nginx rewrite rules

## Quick Fix Script

If you need to quickly update the configuration:

```bash
# 1. Update vite.config.js
cat > frontend/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dictionary/',
})
EOF

# 2. Rebuild frontend
cd frontend && npm run build && cd ..

# 3. Rebuild Docker
docker build -t dictionary-service:latest .
```

## Verification Checklist

- [ ] Vite base path set to `/dictionary/`
- [ ] Frontend rebuilt with `npm run build`
- [ ] Docker image rebuilt
- [ ] Nginx configuration updated
- [ ] Nginx reloaded: `sudo nginx -t && sudo systemctl reload nginx`
- [ ] Static files load correctly
- [ ] API endpoints work
- [ ] Browser console shows no errors

