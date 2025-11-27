# Quick Start Guide

## Prerequisites

1. Make sure the dictionary API server is running:
   ```bash
   # In the root directory
   go run cmd/server/main.go -dict dictionary.gob -addr :8080
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Features to Try

1. **Autocomplete**: Start typing a word (e.g., "hel") and see suggestions appear
2. **Word Lookup**: Click a suggestion or press Enter to see word meanings
3. **Search**: Type any word and search to see its meanings
4. **Responsive**: Try resizing the browser window

## Configuration

If your API is running on a different URL, create a `.env` file:

```env
VITE_API_URL=http://localhost:8080
```

Or set it when running:

```bash
VITE_API_URL=http://your-api-url:8080 npm run dev
```

## Troubleshooting

### API Connection Issues

- Make sure the API server is running on the configured port
- Check browser console for CORS errors
- Verify `VITE_API_URL` matches your API server address

### Build Issues

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

