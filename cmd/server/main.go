package main

import (
	"flag"
	"log"
	"net/http"

	"dictionary-service/internal/dictionary"
	"dictionary-service/internal/server"
)

func main() {
	dictPath := flag.String("dict", "dictionary.gob", "Path to dictionary gob file")
	addr := flag.String("addr", ":8080", "Server address")
	staticDir := flag.String("static", "static", "Directory for static files (frontend)")
	flag.Parse()

	// Load dictionary
	loader := dictionary.NewGobLoader()
	dict, err := loader.Load(*dictPath)
	if err != nil {
		log.Fatalf("Failed to load dictionary: %v", err)
	}

	log.Printf("Dictionary loaded: %d words", len(dict))

	// Create service
	dictService := dictionary.NewService(dict)

	// Setup HTTP server
	handler := server.NewHandler(dictService)
	router := server.NewRouter(handler)
	router.SetStaticDir(*staticDir)
	mux := router.SetupRoutes()

	log.Printf("Starting server on %s", *addr)
	log.Printf("API endpoints:")
	log.Printf("  GET /health - Health check")
	log.Printf("  GET /api/v1/words/{word} - Lookup word")
	log.Printf("  GET /api/v1/suggest/{prefix} - Autocomplete suggestions")
	log.Printf("  GET /api/v1/stats - Get statistics")
	if *staticDir != "" {
		log.Printf("Serving static files from: %s", *staticDir)
	}

	if err := http.ListenAndServe(*addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
