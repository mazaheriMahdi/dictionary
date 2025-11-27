package dictionary

import (
	"compress/gzip"
	"encoding/gob"
	"fmt"
	"os"
	"sort"
	"strings"
)

// Dictionary represents a word dictionary with fast lookup capabilities
type Dictionary map[string][]string

// Loader defines the interface for loading dictionaries
type Loader interface {
	Load(path string) (Dictionary, error)
}

// GobLoader loads dictionaries from compressed gob files
type GobLoader struct{}

// NewGobLoader creates a new gob loader
func NewGobLoader() *GobLoader {
	return &GobLoader{}
}

// Load loads a dictionary from a compressed gob file
func (l *GobLoader) Load(path string) (Dictionary, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open dictionary file: %w", err)
	}
	defer file.Close()

	gzipReader, err := gzip.NewReader(file)
	if err != nil {
		return nil, fmt.Errorf("failed to create gzip reader: %w", err)
	}
	defer gzipReader.Close()

	var dict Dictionary
	decoder := gob.NewDecoder(gzipReader)
	if err := decoder.Decode(&dict); err != nil {
		return nil, fmt.Errorf("failed to decode dictionary: %w", err)
	}

	return dict, nil
}

// Service provides dictionary operations
type Service struct {
	dict        Dictionary
	sortedWords []string // Sorted list of all words for efficient prefix search
}

// NewService creates a new dictionary service
func NewService(dict Dictionary) *Service {
	// Build sorted word list for efficient prefix searches
	words := make([]string, 0, len(dict))
	for word := range dict {
		words = append(words, word)
	}
	sort.Strings(words)

	return &Service{
		dict:        dict,
		sortedWords: words,
	}
}

// Lookup finds meanings for an English word
func (s *Service) Lookup(word string) ([]string, bool) {
	meanings, exists := s.dict[word]
	return meanings, exists
}

// Count returns the total number of words in the dictionary
func (s *Service) Count() int {
	return len(s.dict)
}

// Exists checks if a word exists in the dictionary
func (s *Service) Exists(word string) bool {
	_, exists := s.dict[word]
	return exists
}

// Suggest returns words that start with the given prefix
// limit specifies the maximum number of suggestions to return (default: 20)
func (s *Service) Suggest(prefix string, limit int) []string {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100 // Cap at 100 for performance
	}

	prefix = strings.ToLower(prefix)
	if prefix == "" {
		return []string{}
	}

	// Use binary search to find the first word with the prefix
	idx := sort.Search(len(s.sortedWords), func(i int) bool {
		return strings.ToLower(s.sortedWords[i]) >= prefix
	})

	var suggestions []string
	for i := idx; i < len(s.sortedWords) && len(suggestions) < limit; i++ {
		word := s.sortedWords[i]
		wordLower := strings.ToLower(word)

		if strings.HasPrefix(wordLower, prefix) {
			suggestions = append(suggestions, word)
		} else {
			// Since words are sorted, if this one doesn't match, no more will
			break
		}
	}

	return suggestions
}
