package main

import (
	"log"
	"os"

	"dictionary-service/internal/dictionary"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Usage: go run cmd/convert/main.go <input.json> <output.gob>")
	}

	jsonPath := os.Args[1]
	gobPath := os.Args[2]

	converter := dictionary.NewConverter()
	if err := converter.ConvertJSONToGob(jsonPath, gobPath); err != nil {
		log.Fatalf("Conversion failed: %v", err)
	}

	fileInfo, _ := os.Stat(gobPath)
	log.Printf("Successfully converted and saved to %s (compressed size: %.2f MB)",
		gobPath, float64(fileInfo.Size())/1024/1024)
}
