# API Documentation

This directory contains the API documentation for the Dictionary Service.

## Documentation Files

- **[API.md](API.md)** - Comprehensive API documentation with examples, error codes, and client examples in multiple languages
- **[openapi.yaml](openapi.yaml)** - OpenAPI 3.0 specification for the API

## Viewing the OpenAPI Specification

You can view the OpenAPI specification using various tools:

### Online Viewers
- [Swagger Editor](https://editor.swagger.io/) - Paste the contents of `openapi.yaml`
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Host the spec and view it in Swagger UI

### Command Line Tools
```bash
# Using swagger-codegen
swagger-codegen generate -i docs/openapi.yaml -l html -o docs/html

# Using redoc-cli
npx @redocly/cli preview-docs docs/openapi.yaml
```

### VS Code Extension
Install the "OpenAPI (Swagger) Editor" extension to view and edit the YAML file with syntax highlighting and validation.

## Quick Start

1. Read [API.md](API.md) for detailed endpoint documentation
2. Use [openapi.yaml](openapi.yaml) for API client generation or integration with API tools
3. Test endpoints using the examples provided in [API.md](API.md)

