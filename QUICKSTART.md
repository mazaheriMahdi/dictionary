# Quick Start Guide

Get the Dictionary Service up and running in 5 minutes!

## Prerequisites

- Go 1.25+ installed
- Docker installed (optional, for containerized deployment)

## Step 1: Convert Your Dictionary

If you have a JSON dictionary file:

```bash
go run cmd/convert/main.go dictionary.json dictionary.gob
```

**Expected output:**
```
Reading JSON from dictionary.json...
Converting 910723 words to map structure...
Writing compressed gob file to dictionary.gob...
Successfully converted and saved 910723 words to dictionary.gob
```

## Step 2: Test Locally (Optional)

Test the dictionary works:

```bash
# Test with CLI
go run main.go -dict dictionary.gob hello

# Or start server
go run cmd/server/main.go -dict dictionary.gob -addr :8080
# Visit http://localhost:8080/api/v1/stats
```

## Step 3: Build Docker Image

```bash
docker build -t dictionary-service .
```

## Step 4: Run Container

```bash
docker run -d -p 8080:8080 --name dictionary dictionary-service
```

## Step 5: Access Application

Open your browser:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:8080/api/v1/words/hello
- **Health**: http://localhost:8080/health

## That's It! 🎉

Your dictionary service is now running.

### Next Steps

- **Production Deployment**: See [PRODUCTION.md](PRODUCTION.md)
- **Docker Details**: See [DOCKER.md](DOCKER.md)
- **API Documentation**: See [docs/API.md](docs/API.md)

### Troubleshooting

**Dictionary file not found?**
```bash
ls -lh dictionary.gob  # Should show the file
```

**Port already in use?**
```bash
docker run -d -p 8082:8080 --name dictionary dictionary-service
```

**Need help?**
Check the logs:
```bash
docker logs dictionary
```

