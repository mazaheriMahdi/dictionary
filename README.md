# Dictionary Service

A high-performance dictionary service built with Go, featuring fast word lookups and a RESTful API.

## Features

- **Fast Loading**: Uses compressed gob format for 5-10x faster deserialization than JSON
- **O(1) Lookups**: Map-based structure provides instant word lookups
- **Autocomplete**: Efficient prefix-based word suggestions for search functionality
- **RESTful API**: Clean HTTP API for dictionary operations
- **SOLID Architecture**: Clean, maintainable code following SOLID principles
- **Compressed Storage**: Gzip compression reduces file size by 60-80%

## Project Structure

```
.
├── cmd/
│   ├── convert/          # JSON to gob conversion utility
│   └── server/           # HTTP server application
├── internal/
│   ├── dictionary/       # Dictionary core logic
│   │   ├── dictionary.go # Dictionary service and loader
│   │   └── converter.go  # JSON to gob converter
│   └── server/           # HTTP server components
│       ├── handlers.go   # HTTP request handlers
│       └── router.go     # Route configuration
├── frontend/             # React web application
│   ├── src/              # React source code
│   └── package.json      # Frontend dependencies
├── docs/                 # API documentation
└── main.go               # CLI application
```

## Usage

### 1. Convert JSON to Gob Format

First, convert your JSON dictionary to the compressed gob format:

```bash
go run cmd/convert/main.go dictionary.json dictionary.gob
```

This will:
- Read your JSON file
- Convert it to a map structure for fast lookups
- Compress and save it as a gob file

### 2. Run the HTTP Server

Start the web server:

```bash
go run cmd/server/main.go -dict dictionary.gob -addr :8080
```

Options:
- `-dict`: Path to dictionary gob file (default: `dictionary.gob`)
- `-addr`: Server address (default: `:8080`)

### 3. Use the CLI Application

For command-line lookups:

```bash
go run main.go -dict dictionary.gob hello
```

### 4. Run the Web Frontend

Start the React frontend application:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

**Note:** Make sure the API server is running on `http://localhost:8080` (or configure `VITE_API_URL` in `frontend/.env`)

See [frontend/README.md](frontend/README.md) for detailed frontend documentation.

## API Endpoints

For detailed API documentation, see [docs/API.md](docs/API.md) or [docs/openapi.yaml](docs/openapi.yaml).

### Quick Reference

**Health Check**
```bash
GET /health
```

**Lookup Word**
```bash
GET /api/v1/words/{word}
curl http://localhost:8080/api/v1/words/hello
```

**Autocomplete Suggestions**
```bash
GET /api/v1/suggest/{prefix}?limit=20
curl http://localhost:8080/api/v1/suggest/hel?limit=10
```

**Get Statistics**
```bash
GET /api/v1/stats
curl http://localhost:8080/api/v1/stats
```

See the [full API documentation](docs/API.md) for detailed request/response examples, error codes, and client examples in multiple languages.

## Architecture

### SOLID Principles

- **Single Responsibility**: Each package and struct has a single, well-defined responsibility
- **Open/Closed**: Extensible through interfaces (e.g., `Loader` interface)
- **Liskov Substitution**: Implementations can be swapped (e.g., different loaders)
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions (interfaces) not concretions

### Package Structure

- **`internal/dictionary`**: Core dictionary logic, independent of HTTP
- **`internal/server`**: HTTP-specific code, depends on dictionary service
- **`cmd/convert`**: Standalone conversion utility
- **`cmd/server`**: Standalone HTTP server

## Performance

- **Loading**: ~0.3-0.8 seconds for 910K words (vs 2-5 seconds for JSON)
- **Lookups**: O(1) constant time
- **Autocomplete**: O(log n) binary search + O(k) where k is result count
- **File Size**: 60-80% smaller than uncompressed formats

## Docker Deployment

Build and run the complete application (frontend + backend) in a single Docker container:

```bash
# Build the image
docker build -t dictionary-service .

# Run the container
docker run -d -p 8080:8080 --name dictionary dictionary-service
```

Or use Docker Compose:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:8080` with both the frontend and API served from the same origin.

**For comprehensive production deployment guide, see [PRODUCTION.md](PRODUCTION.md)**

This includes:
- Building the `.gob` dictionary file
- Docker image creation
- Production deployment strategies
- Configuration and monitoring
- Troubleshooting guide

See also [DOCKER.md](DOCKER.md) for detailed Docker-specific instructions.

## Development

Build all components:
```bash
go build ./...
```

Run tests (when added):
```bash
go test ./...
```

