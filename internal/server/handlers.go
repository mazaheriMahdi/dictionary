package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	"dictionary-service/internal/dictionary"
)

// Handler handles HTTP requests for dictionary operations
type Handler struct {
	service *dictionary.Service
}

// NewHandler creates a new HTTP handler
func NewHandler(service *dictionary.Service) *Handler {
	return &Handler{service: service}
}

// LookupWord handles GET /api/v1/words/:word
func (h *Handler) LookupWord(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	word := r.PathValue("word")
	if word == "" {
		http.Error(w, "Word parameter is required", http.StatusBadRequest)
		return
	}

	meanings, exists := h.service.Lookup(word)
	if !exists {
		h.writeJSON(w, http.StatusNotFound, map[string]interface{}{
			"error": "Word not found",
			"word":  word,
		})
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"word":     word,
		"meanings": meanings,
	})
}

// SuggestWords handles GET /api/v1/suggest/{prefix}
func (h *Handler) SuggestWords(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	prefix := r.PathValue("prefix")
	if prefix == "" {
		http.Error(w, "Prefix parameter is required", http.StatusBadRequest)
		return
	}

	// Get limit from query parameter (default: 20)
	limit := 20
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		var err error
		if limit, err = parseInt(limitStr); err != nil {
			http.Error(w, "Invalid limit parameter", http.StatusBadRequest)
			return
		}
	}

	suggestions := h.service.Suggest(prefix, limit)

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"prefix":      prefix,
		"suggestions": suggestions,
		"count":       len(suggestions),
	})
}

// GetStats handles GET /api/v1/stats
func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"total_words": h.service.Count(),
	})
}

// HealthCheck handles GET /health
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{
		"status": "healthy",
	})
}

// writeJSON writes a JSON response
func (h *Handler) writeJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// parseInt parses a string to integer
func parseInt(s string) (int, error) {
	return strconv.Atoi(s)
}
