package dictionary

import (
	"compress/gzip"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"os"
)

// JSONDictionary represents the input JSON structure
type JSONDictionary struct {
	TotalUniqueWords int    `json:"TotalUniqueWords"`
	Words            []Word `json:"Words"`
}

// Word represents a word entry in the JSON
type Word struct {
	EnglishWord string   `json:"EnglishWord"`
	Meanings    []string `json:"Meanings"`
}

// Converter handles conversion from JSON to compressed gob format
type Converter struct{}

// NewConverter creates a new converter
func NewConverter() *Converter {
	return &Converter{}
}

// ConvertJSONToGob converts JSON dictionary to compressed gob format
func (c *Converter) ConvertJSONToGob(jsonPath, gobPath string) error {
	jsonDict, err := c.readJSON(jsonPath)
	if err != nil {
		return fmt.Errorf("failed to read JSON: %w", err)
	}

	wordMap := c.convertToMap(jsonDict)

	if err := c.writeGob(wordMap, gobPath); err != nil {
		return fmt.Errorf("failed to write gob: %w", err)
	}

	return nil
}

// readJSON reads and parses the JSON file
func (c *Converter) readJSON(jsonPath string) (*JSONDictionary, error) {
	jsonFile, err := os.Open(jsonPath)
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()

	var jsonDict JSONDictionary
	decoder := json.NewDecoder(jsonFile)
	if err := decoder.Decode(&jsonDict); err != nil {
		return nil, err
	}

	return &jsonDict, nil
}

// convertToMap converts JSON structure to map for fast lookups
func (c *Converter) convertToMap(jsonDict *JSONDictionary) Dictionary {
	wordMap := make(Dictionary, jsonDict.TotalUniqueWords)
	for _, word := range jsonDict.Words {
		wordMap[word.EnglishWord] = word.Meanings
	}
	return wordMap
}

// writeGob writes the dictionary map to a compressed gob file
func (c *Converter) writeGob(wordMap Dictionary, gobPath string) error {
	gobFile, err := os.Create(gobPath)
	if err != nil {
		return err
	}
	defer gobFile.Close()

	gzipWriter := gzip.NewWriter(gobFile)
	defer gzipWriter.Close()

	encoder := gob.NewEncoder(gzipWriter)
	return encoder.Encode(wordMap)
}
