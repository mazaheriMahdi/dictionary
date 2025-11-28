import { useState, useEffect, useRef } from 'react'
import { Input, Button, Card, CardBody, CardHeader, Chip, Skeleton, Autocomplete, AutocompleteItem, Switch } from '@heroui/react'
import { MagnifyingGlassIcon, BookOpenIcon, SparklesIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [minLoadingTime, setMinLoadingTime] = useState(false) // Minimum loading display time
  const [stats, setStats] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Apply dark mode to HTML element
  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

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
    setMinLoadingTime(true)
    setSelectedWord(word)
    setShowSuggestions(false)

    // Minimum loading time for smooth UX (500ms)
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 500))

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
      // Wait for both API call and minimum time
      await minTimePromise
      setLoading(false)
      // Small delay before hiding min loading state for smooth transition
      setTimeout(() => setMinLoadingTime(false), 100)
    }
  }

  const handleSearchChange = (value) => {
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

  const handleSelectionChange = (key) => {
    if (key) {
      fetchWord(key)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft, Eye-Friendly Background */}
      <div className="fixed inset-0 -z-10">
        {/* Very subtle gradient orbs - Barely visible */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0072f5]/2 dark:bg-[#0072f5]/1 rounded-full blur-[150px]"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#ff0080]/2 dark:bg-[#ff0080]/1 rounded-full blur-[150px]"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Base background - Warmer, softer tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#0f0f0f] dark:via-[#1a1a1a] dark:to-[#151515]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="fixed top-4 right-4 z-50"
        >
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-[#1a1a1a]/80 border border-default-200/20 dark:border-[#2a2a2a]/30 shadow-xl">
            <CardBody className="p-2">
              <div className="flex items-center gap-2">
                <SunIcon className="h-4 w-4 text-default-500" />
                <Switch
                  isSelected={isDark}
                  onValueChange={setIsDark}
                  size="sm"
                  color="primary"
                />
                <MoonIcon className="h-4 w-4 text-default-500" />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatDelay: 4,
                ease: "easeInOut"
              }}
              className="p-3 rounded-2xl backdrop-blur-xl bg-[#0072f5]/5 dark:bg-[#0072f5]/5 border border-[#0072f5]/10 dark:border-[#0072f5]/10 shadow-lg"
            >
              <BookOpenIcon className="h-12 w-12 text-[#0072f5] dark:text-[#0072f5]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl sm:text-5xl font-bold"
            >
              <span className="bg-gradient-to-r from-[#0072f5] via-[#0072f5] to-[#7828c8] dark:from-[#0072f5] dark:via-[#0072f5] dark:to-[#7828c8] bg-clip-text text-transparent opacity-90">
                Dictionary
              </span>
            </motion.h1>
          </motion.div>
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="inline-block"
            >
              <Chip
                variant="flat"
                className="backdrop-blur-sm bg-[#0072f5]/5 dark:bg-[#0072f5]/10 border border-[#0072f5]/15 dark:border-[#0072f5]/15 shadow-md"
              >
                <span className="text-sm font-medium text-[#0072f5]/80 dark:text-[#0072f5]/70">
                  {stats.total_words?.toLocaleString()} words available
                </span>
              </Chip>
            </motion.div>
          )}
        </motion.div>

        {/* Search Bar - HeroUI Style */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
          className="relative mb-8"
          ref={searchRef}
        >
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <Autocomplete
                className="flex-1"
                placeholder="Search for a word..."
                value={searchTerm}
                onInputChange={handleSearchChange}
                onSelectionChange={handleSelectionChange}
                selectedKey={selectedWord}
                inputProps={{
                  classNames: {
                    input: "text-lg font-medium",
                    inputWrapper: "h-16 shadow-lg backdrop-blur-xl bg-white/90 dark:bg-[#1a1a1a]/90 border-2 border-default-200/40 dark:border-[#2a2a2a]/40 hover:border-[#0072f5]/20 dark:hover:border-[#0072f5]/20 focus-within:!border-[#0072f5]/40 dark:focus-within:!border-[#0072f5]/40 transition-all duration-300 [&:focus-within]:!border-[#0072f5]/40 [&:focus-within]:dark:!border-[#0072f5]/40 [&:focus-within]:!ring-0 [&:focus-within]:!ring-offset-0",
                    innerWrapper: "gap-2",
                  },
                }}
                startContent={<MagnifyingGlassIcon className="h-5 w-5 text-default-400" />}
                listboxProps={{
                  emptyContent: "No words found",
                  classNames: {
                    base: "backdrop-blur-xl bg-white/95 dark:bg-[#1a1a1a]/95 border border-default-200/20 dark:border-[#2a2a2a]/30 shadow-2xl",
                  },
                }}
                popoverProps={{
                  classNames: {
                    content: "backdrop-blur-xl bg-white/95 dark:bg-[#1a1a1a]/95 border border-default-200/20 dark:border-[#2a2a2a]/30 shadow-2xl",
                  },
                }}
              >
                {suggestions.map((suggestion) => (
                  <AutocompleteItem
                    key={suggestion}
                    value={suggestion}
                    startContent={<SparklesIcon className="h-4 w-4 text-[#0072f5]/70 dark:text-[#0072f5]/70" />}
                    textValue={suggestion}
                    classNames={{
                      base: "hover:bg-[#0072f5]/5 dark:hover:bg-[#0072f5]/5",
                    }}
                  >
                    {suggestion}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                  <Button
                    type="submit"
                    size="lg"
                    className="h-16 px-8 shadow-xl backdrop-blur-xl bg-[#0072f5]/90 dark:bg-[#0072f5]/90 hover:bg-[#0072f5] dark:hover:bg-[#0072f5] font-semibold text-white border-0 min-w-[120px] opacity-90 hover:opacity-100"
                    startContent={<MagnifyingGlassIcon className="h-5 w-5" />}
                    isLoading={loading}
                    isDisabled={!searchTerm.trim()}
                    classNames={{
                      base: "shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed",
                    }}
                  >
                    Search
                  </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>

        {/* Results Container - Fixed to prevent layout shift */}
        {(loading || minLoadingTime || selectedWord) && (
          <div className="min-h-[400px] mb-8">
            <AnimatePresence mode="wait">
              {(loading || minLoadingTime) && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <Card className="shadow-xl backdrop-blur-xl bg-white/90 dark:bg-[#1a1a1a]/90 border border-default-200/30 dark:border-[#2a2a2a]/40 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1f1f1f] transition-all duration-300">
                    <CardHeader className="flex gap-3 pb-2">
                      <Skeleton className="rounded-lg">
                        <div className="h-8 w-8 rounded-lg bg-default-200 dark:bg-default-100" />
                      </Skeleton>
                      <Skeleton className="rounded-lg">
                        <div className="h-8 w-48 rounded-lg bg-default-200 dark:bg-default-100" />
                      </Skeleton>
                    </CardHeader>
                    <CardBody>
                      <Skeleton className="rounded-lg mb-4">
                        <div className="h-6 w-32 rounded-lg bg-default-200 dark:bg-default-100" />
                      </Skeleton>
                      <div className="space-y-3">
                        {[1, 2, 3].map((index) => (
                          <Skeleton key={index} className="rounded-lg">
                            <div className="h-20 w-full rounded-lg bg-default-200 dark:bg-default-100" />
                          </Skeleton>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {!loading && !minLoadingTime && selectedWord && (
                <motion.div
                  key={selectedWord}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <Card className="shadow-xl backdrop-blur-xl bg-white/90 dark:bg-[#1a1a1a]/90 border border-default-200/30 dark:border-[#2a2a2a]/40 hover:shadow-2xl hover:bg-white dark:hover:bg-[#1f1f1f] transition-all duration-300">
                  <CardHeader className="flex gap-3 pb-2">
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      whileHover={{ rotate: 15, scale: 1.1 }}
                    >
                      <BookOpenIcon className="h-8 w-8 text-[#0072f5]/80 dark:text-[#0072f5]/80" />
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-bold text-foreground"
                    >
                      {selectedWord}
                    </motion.h2>
                  </CardHeader>
                  <CardBody>
                    {meanings.length > 0 ? (
                      <div>
                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4"
                        >
                          Meanings:
                        </motion.h3>
                        <div className="space-y-3">
                          <AnimatePresence>
                            {meanings.map((meaning, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ 
                                  delay: index * 0.1 + 0.5, 
                                  duration: 0.4,
                                  type: "spring",
                                  stiffness: 100
                                }}
                                whileHover={{ 
                                  scale: 1.02, 
                                  x: 8,
                                  transition: { duration: 0.2 }
                                }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <Card className="backdrop-blur-sm bg-slate-50/80 dark:bg-[#252525]/80 border-l-4 border-[#0072f5]/40 dark:border-[#0072f5]/40 shadow-sm hover:shadow-md hover:bg-slate-100/80 dark:hover:bg-[#2a2a2a]/80 transition-all hover:scale-[1.01] border border-slate-200/50 dark:border-[#2a2a2a]/50">
                                  <CardBody className="flex flex-row items-start gap-3 py-4">
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ 
                                        delay: index * 0.1 + 0.6, 
                                        type: "spring",
                                        stiffness: 200
                                      }}
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                      <Chip
                                        variant="flat"
                                        className="min-w-[2rem] justify-center font-bold shadow-sm bg-[#0072f5]/15 dark:bg-[#0072f5]/15 text-[#0072f5] dark:text-[#0072f5] border border-[#0072f5]/25 dark:border-[#0072f5]/25"
                                      >
                                        {index + 1}
                                      </Chip>
                                    </motion.div>
                                    <motion.span
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: index * 0.1 + 0.7 }}
                                      className="text-foreground text-lg flex-1"
                                    >
                                      {meaning}
                                    </motion.span>
                                  </CardBody>
                                </Card>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center py-8"
                      >
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                          No meanings found for "{selectedWord}"
                        </p>
                      </motion.div>
                    )}
                  </CardBody>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State - Centered */}
        <AnimatePresence>
          {!loading && !minLoadingTime && !selectedWord && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center min-h-[60vh] -mt-20"
            >
              <Card className="backdrop-blur-xl bg-white/90 dark:bg-[#1a1a1a]/90 border border-default-200/30 dark:border-[#2a2a2a]/40 shadow-xl px-12 py-8">
                <CardBody className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="p-4 rounded-2xl backdrop-blur-sm bg-[#0072f5]/5 dark:bg-[#0072f5]/5 border border-[#0072f5]/10 dark:border-[#0072f5]/10"
                  >
                    <BookOpenIcon className="h-16 w-16 text-[#0072f5]/60 dark:text-[#0072f5]/60 mx-auto" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-700 dark:text-slate-300 text-lg font-medium"
                  >
                    Start typing to search for words...
                  </motion.p>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
