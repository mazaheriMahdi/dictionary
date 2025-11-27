#!/bin/bash

# Build script for Dictionary Service Docker image

set -e

echo "Building Dictionary Service Docker image..."

# Check if dictionary.gob exists
if [ ! -f "dictionary.gob" ]; then
    echo "Error: dictionary.gob not found in project root"
    echo "Please convert your JSON dictionary first:"
    echo "  go run cmd/convert/main.go dictionary.json dictionary.gob"
    exit 1
fi

# Build the Docker image
docker build -t dictionary-service:latest .

echo ""
echo "Build complete!"
echo ""
echo "To run the container:"
echo "  docker run -d -p 8080:8080 --name dictionary dictionary-service:latest"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up -d"
echo ""

