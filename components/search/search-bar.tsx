"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowser } from "@/lib/supabase-client"
import { useDebounce } from "@/hooks/use-debounce"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SearchResult {
  id: string
  name: string
  category_name?: string
}

export default function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      const supabase = getSupabaseBrowser()

      // Search products
      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, category_id, categories(name)")
        .ilike("name", `%${debouncedQuery}%`)
        .eq("is_archived", false)
        .limit(5)

      if (error) {
        console.error("Error searching products:", error)
        setLoading(false)
        return
      }

      const formattedResults = products.map((product) => ({
        id: product.id,
        name: product.name,
        category_name: product.categories?.name,
      }))

      setResults(formattedResults)
      setLoading(false)
    }

    fetchSearchResults()
  }, [debouncedQuery])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setOpen(false)
    }
  }

  const handleSelect = (id: string) => {
    router.push(`/product/${id}`)
    setOpen(false)
    setQuery("")
  }

  if (mobile) {
    return (
      <form onSubmit={handleSearch} className="flex items-center w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search for products..."
            className="w-full pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="ml-2 bg-glacier-600 hover:bg-glacier-700">
          Search
        </Button>
      </form>
    )
  }

  return (
    <div className="relative w-full max-w-md">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Search products..."
              className="w-full pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search products..." value={query} onValueChange={setQuery} />
              {loading && <CommandEmpty>Searching...</CommandEmpty>}
              {!loading && results.length === 0 && query.length > 1 && <CommandEmpty>No results found.</CommandEmpty>}
              {results.length > 0 && (
                <CommandGroup heading="Products">
                  {results.map((result) => (
                    <CommandItem key={result.id} onSelect={() => handleSelect(result.id)} className="cursor-pointer">
                      <div className="flex flex-col">
                        <span>{result.name}</span>
                        {result.category_name && (
                          <span className="text-xs text-muted-foreground">in {result.category_name}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-muted-foreground"
                onClick={() => handleSearch()}
              >
                Search for "{query}"
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

