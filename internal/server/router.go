package server

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// Router sets up HTTP routes
type Router struct {
	handler   *Handler
	staticDir string
}

// NewRouter creates a new router
func NewRouter(handler *Handler) *Router {
	return &Router{
		handler:   handler,
		staticDir: "static",
	}
}

// SetStaticDir sets the directory for static files
func (r *Router) SetStaticDir(dir string) {
	r.staticDir = dir
}

// SetupRoutes configures all HTTP routes with middleware
func (r *Router) SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /health", r.handler.HealthCheck)

	// API v1 routes
	mux.HandleFunc("GET /api/v1/words/{word}", r.handler.LookupWord)
	mux.HandleFunc("GET /api/v1/suggest/{prefix}", r.handler.SuggestWords)
	mux.HandleFunc("GET /api/v1/stats", r.handler.GetStats)

	// Serve static files if directory exists
	if r.staticDir != "" {
		if _, err := os.Stat(r.staticDir); err == nil {
			// Serve static files
			fileServer := http.FileServer(http.Dir(r.staticDir))
			mux.HandleFunc("GET /", func(w http.ResponseWriter, req *http.Request) {
				// Don't serve API routes as static files
				if strings.HasPrefix(req.URL.Path, "/api/") || req.URL.Path == "/health" {
					http.NotFound(w, req)
					return
				}

				// Check if file exists
				path := filepath.Join(r.staticDir, req.URL.Path)
				if _, err := os.Stat(path); os.IsNotExist(err) {
					// File doesn't exist, serve index.html for SPA routing
					indexPath := filepath.Join(r.staticDir, "index.html")
					if _, err := os.Stat(indexPath); err == nil {
						http.ServeFile(w, req, indexPath)
						return
					}
				}

				// Serve the file
				fileServer.ServeHTTP(w, req)
			})
		}
	}

	// Apply middleware (CORS first, then logging)
	return loggingMiddleware(corsMiddleware(mux))
}
