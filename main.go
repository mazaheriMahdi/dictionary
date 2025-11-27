package main

import (
	"flag"
	"fmt"
	"log"

	"dictionary-service/internal/dictionary"
)

func main() {
	dictPath := flag.String("dict", "dictionary.gob", "Path to dictionary gob file")
	flag.Parse()

	// Load dictionary
	loader := dictionary.NewGobLoader()
	dict, err := loader.Load(*dictPath)
	if err != nil {
		log.Fatalf("Failed to load dictionary: %v", err)
	}

	log.Printf("Dictionary loaded: %d words", len(dict))

	// Create service
	service := dictionary.NewService(dict)

	// Example usage
	if len(flag.Args()) > 0 {
		word := flag.Args()[0]
		meanings, exists := service.Lookup(word)
		if exists {
			fmt.Printf("Word: %s\n", word)
			fmt.Printf("Meanings: %v\n", meanings)
		} else {
			fmt.Printf("Word '%s' not found in dictionary\n", word)
		}
	} else {
		fmt.Printf("Dictionary loaded with %d words.\n", service.Count())
		fmt.Printf("Usage: %s <word> to lookup\n", flag.Arg(0))
		fmt.Printf("Or run the server: go run cmd/server/main.go -dict %s\n", *dictPath)
	}
}
