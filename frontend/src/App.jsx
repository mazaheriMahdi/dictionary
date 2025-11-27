import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon as MagnifyingGlassIconSolid } from '@heroicons/react/24/solid'

// Use relative URL if VITE_API_URL is empty (for same-origin in Docker)
// Otherwise use the configured URL or default to localhost:8082
const API_BASE_URL = import.meta.env.VITE_API_URL === '' 
  ? '' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:8080')

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedWord, setSelectedWord] = useState(null)
  const [meanings, setMeanings] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/stats`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchSuggestions = async (prefix) => {
    if (prefix.length < 1) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/suggest/${encodeURIComponent(prefix)}?limit=10`)
      const data = await response.json()
      setSuggestions(data.suggestions || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    }
  }

  const fetchWord = async (word) => {
    if (!word.trim()) return

    setLoading(true)
    setSelectedWord(word)
    setShowSuggestions(false)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/words/${encodeURIComponent(word)}`)
      if (response.ok) {
        const data = await response.json()
        setMeanings(data.meanings || [])
      } else {
        setMeanings([])
      }
    } catch (error) {
      console.error('Failed to fetch word:', error)
      setMeanings([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    fetchSuggestions(value)
  }

  const handleSuggestionClick = (word) => {
    setSearchTerm(word)
    fetchWord(word)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      fetchWord(searchTerm.trim())
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpenIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
              Dictionary
            </h1>
          </div>
          {stats && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {stats.total_words?.toLocaleString()} words available
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-8" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search for a word..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-lg"
              />
              {searchTerm && (
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <div className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <MagnifyingGlassIconSolid className="h-5 w-5" />
                    <span className="hidden sm:inline">Search</span>
                  </div>
                </button>
              )}
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200 first:rounded-t-xl last:rounded-b-xl"
                >
                  <SparklesIcon className="h-4 w-4 text-primary-500" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        )}

        {!loading && selectedWord && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
              <BookOpenIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              {selectedWord}
            </h2>

            {meanings.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  Meanings:
                </h3>
                <ul className="space-y-3">
                  {meanings.map((meaning, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-primary-500"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 text-lg">{meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  No meanings found for "{selectedWord}"
                </p>
              </div>
            )}
          </div>
        )}

        {!loading && !selectedWord && (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Start typing to search for words...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
