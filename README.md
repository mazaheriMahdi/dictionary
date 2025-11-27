# 📚 Dictionary Service

> A high-performance, production-ready dictionary service with blazing-fast lookups, autocomplete, and a beautiful web interface.

[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)

Dictionary Service is a complete dictionary application built with Go and React, designed for high performance and easy deployment. It features instant word lookups, intelligent autocomplete suggestions, and a modern web interface.

## ✨ Features

- ⚡ **Lightning Fast**: 5-10x faster loading than JSON with compressed gob format
- 🔍 **O(1) Lookups**: Map-based structure for instant word lookups
- 🎯 **Smart Autocomplete**: Efficient prefix-based word suggestions
- 🎨 **Beautiful UI**: Modern React frontend with Tailwind CSS and Heroicons
- 🐳 **Docker Ready**: Single container deployment with frontend + backend
- 📦 **Compressed Storage**: 60-80% smaller file size with gzip compression
- 🏗️ **SOLID Architecture**: Clean, maintainable, and extensible codebase
- 🌐 **RESTful API**: Clean HTTP API with OpenAPI documentation
- 🔒 **Production Ready**: Health checks, logging, and monitoring support

## 🚀 Quick Start

### Prerequisites

- **Go 1.25+** (for building from source)
- **Docker** (for containerized deployment)
- **Node.js 18+** (for frontend development, optional)

### 5-Minute Setup

1. **Convert your dictionary JSON to gob format:**
   ```bash
   go run cmd/convert/main.go dictionary.json dictionary.gob
   ```

2. **Run with Docker:**
   ```bash
   docker build -t dictionary-service .
   docker run -d -p 8080:8080 --name dictionary dictionary-service
   ```

3. **Access the application:**
   - Frontend: http://localhost:8080
   - API: http://localhost:8080/api/v1/stats

That's it! 🎉

For more detailed instructions, see [QUICKSTART.md](QUICKSTART.md).

## 📖 Table of Contents

- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [Performance](#-performance)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## 📦 Installation

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/dictionary-service.git
cd dictionary-service

# Convert your dictionary (if needed)
go run cmd/convert/main.go dictionary.json dictionary.gob

# Build and run
docker-compose up -d
```

### Option 2: From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/dictionary-service.git
cd dictionary-service

# Build backend
go build ./cmd/server

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Run server
./server -dict dictionary.gob -addr :8080 -static frontend/dist
```

## 💻 Usage

### Command Line Interface

```bash
# Lookup a word
go run main.go -dict dictionary.gob hello

# Output:
# Word: hello
# Meanings: ["سلام", "درود"]
```

### HTTP Server

```bash
# Start the server
go run cmd/server/main.go -dict dictionary.gob -addr :8080

# Or use the binary
./server -dict dictionary.gob -addr :8080
```

### Web Interface

The React frontend provides a beautiful, interactive interface:
- Real-time search with autocomplete
- Instant word lookups
- Responsive design
- Dark mode support

Access at: http://localhost:8080

### Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📡 API Documentation

### Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/words/{word}` | GET | Lookup word meanings |
| `/api/v1/suggest/{prefix}` | GET | Get autocomplete suggestions |
| `/api/v1/stats` | GET | Get dictionary statistics |

### Example Requests

```bash
# Health check
curl http://localhost:8080/health

# Lookup word
curl http://localhost:8080/api/v1/words/hello

# Autocomplete
curl http://localhost:8080/api/v1/suggest/hel?limit=10

# Statistics
curl http://localhost:8080/api/v1/stats
```

### Full Documentation

- **[API.md](docs/API.md)** - Complete API reference with examples
- **[openapi.yaml](docs/openapi.yaml)** - OpenAPI 3.0 specification
- **[API Documentation](docs/README.md)** - Documentation index

## 🚢 Deployment

### Docker Deployment

```bash
# Build image
docker build -t dictionary-service:latest .

# Run container
docker run -d \
  -p 8080:8080 \
  --name dictionary \
  --restart unless-stopped \
  dictionary-service:latest
```

### Production Deployment

For comprehensive production deployment guide, see **[PRODUCTION.md](PRODUCTION.md)**.

Includes:
- Building dictionary files
- Docker image creation
- Kubernetes deployment
- Nginx reverse proxy setup
- Monitoring and maintenance
- Troubleshooting

### Gateway/Reverse Proxy

If deploying behind a gateway with path prefix (e.g., `/dictionary/`), see:
- **[NGINX_GATEWAY.md](NGINX_GATEWAY.md)** - Complete gateway configuration
- **[GATEWAY_FIX.md](GATEWAY_FIX.md)** - Quick fix guide

### Docker Compose

```yaml
version: '3.8'
services:
  dictionary:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - ./dictionary.gob:/app/dictionary.gob:ro
    restart: unless-stopped
```

## 🏗️ Architecture

### Project Structure

```
dictionary-service/
├── cmd/
│   ├── convert/          # JSON to gob conversion utility
│   └── server/           # HTTP server application
├── internal/
│   ├── dictionary/       # Core dictionary logic
│   │   ├── dictionary.go # Service and loader
│   │   └── converter.go  # JSON converter
│   └── server/           # HTTP server components
│       ├── handlers.go   # Request handlers
│       ├── middleware.go # CORS, logging
│       └── router.go     # Route configuration
├── frontend/             # React web application
│   ├── src/
│   │   ├── App.jsx       # Main component
│   │   └── ...
│   └── package.json
├── docs/                 # Documentation
│   ├── API.md
│   └── openapi.yaml
├── Dockerfile            # Multi-stage build
├── docker-compose.yml    # Docker Compose config
└── README.md
```

### SOLID Principles

The codebase follows SOLID principles:

- **Single Responsibility**: Each package has one clear purpose
- **Open/Closed**: Extensible through interfaces (e.g., `Loader`)
- **Liskov Substitution**: Implementations are swappable
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions

### Key Components

- **Dictionary Service**: Core lookup and suggestion logic
- **HTTP Handlers**: RESTful API endpoints
- **Static File Server**: Serves React frontend
- **Middleware**: CORS, logging, health checks

## ⚡ Performance

### Benchmarks

| Metric | Performance |
|--------|-------------|
| **Dictionary Loading** | ~0.3-0.8s for 910K words |
| **Word Lookup** | O(1) - < 1ms |
| **Autocomplete** | O(log n) + O(k) - < 10ms |
| **File Size** | 60-80% smaller than JSON |
| **Memory Usage** | ~200-400MB for 910K words |

### Optimization Features

- **Compressed Storage**: Gzip-compressed gob format
- **Map-based Lookups**: O(1) constant time
- **Binary Search**: Efficient prefix matching
- **Single Container**: Reduced network overhead

## 🛠️ Development

### Prerequisites

- Go 1.25+
- Node.js 18+
- Docker (optional)

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/dictionary-service.git
cd dictionary-service

# Install Go dependencies
go mod download

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Building

```bash
# Build backend
go build ./cmd/server

# Build frontend
cd frontend
npm run build
cd ..

# Build everything
go build ./...
```

### Running Tests

```bash
# Run Go tests
go test ./...

# Run frontend tests (when added)
cd frontend
npm test
```

### Development Mode

```bash
# Terminal 1: Run backend
go run cmd/server/main.go -dict dictionary.gob -addr :8080

# Terminal 2: Run frontend dev server
cd frontend
npm run dev
```

### Code Structure

- **Backend**: Go with standard project layout
- **Frontend**: React with Vite
- **API**: RESTful with OpenAPI spec
- **Testing**: Go testing framework

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

We have a detailed [Contributing Guide](CONTRIBUTING.md) that covers:
- Code of conduct
- Development setup
- Code style guidelines
- Pull request process
- Reporting bugs and suggesting features

**Quick Start:**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Go](https://golang.org/) and [React](https://react.dev/)
- UI components from [Headless UI](https://headlessui.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[PRODUCTION.md](PRODUCTION.md)** - Production deployment guide
- **[DOCKER.md](DOCKER.md)** - Docker-specific documentation
- **[NGINX_GATEWAY.md](NGINX_GATEWAY.md)** - Gateway configuration
- **[docs/API.md](docs/API.md)** - Complete API reference
- **[frontend/README.md](frontend/README.md)** - Frontend documentation

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

## 📞 Support

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: [GitHub Issues](https://github.com/yourusername/dictionary-service/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dictionary-service/discussions)

---

Made with ❤️ by the Mahdi Mazaheri
