# Dictionary Service API Documentation

## Base URL

```
http://localhost:8080
```

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## Endpoints

### Health Check

Check if the service is running and healthy.

**Endpoint:** `GET /health`

**Response:**
- **Status Code:** `200 OK`
- **Content-Type:** `application/json`

**Example Request:**
```bash
curl http://localhost:8080/health
```

**Example Response:**
```json
{
  "status": "healthy"
}
```

---

### Lookup Word

Get the meanings for a specific English word.

**Endpoint:** `GET /api/v1/words/{word}`

**Path Parameters:**
- `word` (string, required) - The English word to lookup

**Response:**
- **Status Code:** `200 OK` - Word found
- **Status Code:** `404 Not Found` - Word not found
- **Status Code:** `405 Method Not Allowed` - Invalid HTTP method
- **Content-Type:** `application/json`

**Example Request:**
```bash
curl http://localhost:8080/api/v1/words/hello
```

**Example Response (200 OK):**
```json
{
  "word": "hello",
  "meanings": [
    "سلام",
    "درود"
  ]
}
```

**Example Response (404 Not Found):**
```json
{
  "error": "Word not found",
  "word": "nonexistentword"
}
```

---

### Autocomplete Suggestions

Get word suggestions that start with a given prefix. Useful for implementing autocomplete functionality in search interfaces.

**Endpoint:** `GET /api/v1/suggest/{prefix}`

**Path Parameters:**
- `prefix` (string, required) - The prefix to search for (case-insensitive)

**Query Parameters:**
- `limit` (integer, optional) - Maximum number of suggestions to return
  - Default: `20`
  - Maximum: `100`
  - Minimum: `1`

**Response:**
- **Status Code:** `200 OK`
- **Status Code:** `400 Bad Request` - Invalid limit parameter
- **Status Code:** `405 Method Not Allowed` - Invalid HTTP method
- **Content-Type:** `application/json`

**Example Request:**
```bash
# Basic request with default limit (20)
curl http://localhost:8080/api/v1/suggest/hel

# Request with custom limit
curl http://localhost:8080/api/v1/suggest/hel?limit=10

# Case-insensitive search
curl http://localhost:8080/api/v1/suggest/HEL
```

**Example Response (200 OK):**
```json
{
  "prefix": "hel",
  "suggestions": [
    "hello",
    "help",
    "helmet",
    "helpless",
    "helix",
    "heliport",
    "hellebore",
    "hellfire",
    "hellish",
    "helmsman"
  ],
  "count": 10
}
```

**Example Response (400 Bad Request):**
```json
{
  "error": "Invalid limit parameter"
}
```

**Notes:**
- The search is case-insensitive
- Results are returned in alphabetical order
- Empty prefix returns an empty suggestions array
- If fewer words match than the limit, all matching words are returned

---

### Get Statistics

Get statistics about the dictionary.

**Endpoint:** `GET /api/v1/stats`

**Response:**
- **Status Code:** `200 OK`
- **Status Code:** `405 Method Not Allowed` - Invalid HTTP method
- **Content-Type:** `application/json`

**Example Request:**
```bash
curl http://localhost:8080/api/v1/stats
```

**Example Response:**
```json
{
  "total_words": 910723
}
```

---

## Error Responses

All error responses follow a consistent format:

**400 Bad Request:**
```json
{
  "error": "Error message describing what went wrong"
}
```

**404 Not Found:**
```json
{
  "error": "Word not found",
  "word": "searched_word"
}
```

**405 Method Not Allowed:**
```json
{
  "error": "Method not allowed"
}
```

**500 Internal Server Error:**
Standard HTTP error response (not JSON formatted)

---

## Rate Limiting

Currently, no rate limiting is implemented. All endpoints are available without restrictions.

---

## Response Times

Typical response times:
- **Health Check:** < 1ms
- **Word Lookup:** < 1ms (O(1) map lookup)
- **Autocomplete:** < 10ms (for 20 suggestions from 910K words)
- **Statistics:** < 1ms

---

## Examples

### Complete Workflow

```bash
# 1. Check service health
curl http://localhost:8080/health

# 2. Get dictionary statistics
curl http://localhost:8080/api/v1/stats

# 3. Search for word suggestions as user types
curl http://localhost:8080/api/v1/suggest/hel?limit=5

# 4. Lookup a specific word
curl http://localhost:8080/api/v1/words/hello
```

### JavaScript/TypeScript Example

```javascript
// Lookup word
async function lookupWord(word) {
  const response = await fetch(`http://localhost:8080/api/v1/words/${word}`);
  if (response.ok) {
    const data = await response.json();
    return data.meanings;
  }
  return null;
}

// Get autocomplete suggestions
async function getSuggestions(prefix, limit = 20) {
  const response = await fetch(
    `http://localhost:8080/api/v1/suggest/${prefix}?limit=${limit}`
  );
  if (response.ok) {
    const data = await response.json();
    return data.suggestions;
  }
  return [];
}

// Usage
lookupWord('hello').then(meanings => console.log(meanings));
getSuggestions('hel', 10).then(suggestions => console.log(suggestions));
```

### Python Example

```python
import requests

BASE_URL = "http://localhost:8080"

def lookup_word(word):
    """Lookup a word and return its meanings."""
    response = requests.get(f"{BASE_URL}/api/v1/words/{word}")
    if response.status_code == 200:
        return response.json()["meanings"]
    return None

def get_suggestions(prefix, limit=20):
    """Get word suggestions for a prefix."""
    response = requests.get(
        f"{BASE_URL}/api/v1/suggest/{prefix}",
        params={"limit": limit}
    )
    if response.status_code == 200:
        return response.json()["suggestions"]
    return []

# Usage
meanings = lookup_word("hello")
print(meanings)

suggestions = get_suggestions("hel", limit=10)
print(suggestions)
```

---

## Versioning

The API uses URL versioning. Current version: `v1`

All endpoints are prefixed with `/api/v1/` except for the health check endpoint.

---

## Changelog

### v1.0.0
- Initial API release
- Word lookup endpoint
- Autocomplete suggestions endpoint
- Statistics endpoint
- Health check endpoint

