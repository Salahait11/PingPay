import { useState, useCallback } from 'react'
import { useDebouncedCallback } from './useDebounce'

export interface FilterState {
  searchTerm: string
  statusFilter: string
  typeFilter: string
  dateFilter: string
  [key: string]: string // Pour permettre des filtres supplémentaires
}

export interface UseFiltersOptions {
  debounceDelay?: number
  initialFilters?: Partial<FilterState>
  onFiltersChange?: (filters: FilterState) => void
}

export function useFilters(options: UseFiltersOptions = {}) {
  const {
    debounceDelay = 500,
    initialFilters = {},
    onFiltersChange
  } = options

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all',
    dateFilter: 'all',
    ...initialFilters
  })

  const [isLoading, setIsLoading] = useState(false)

  // Fonction pour mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prevFilters => {
      const updatedFilters: FilterState = {
        ...prevFilters,
        ...Object.keys(newFilters).reduce((acc, key) => {
          acc[key] = newFilters[key] ?? '';
          return acc;
        }, {} as { [key: string]: string })
      };
      if (onFiltersChange) {
        onFiltersChange(updatedFilters);
      }
      return updatedFilters;
    });
  }, [onFiltersChange]);

  // Fonction debounced pour la recherche
  const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
    updateFilters({ searchTerm })
  }, debounceDelay)

  // Fonction pour mettre à jour la recherche avec debounce
  const updateSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }))
    debouncedSearch(searchTerm)
  }, [debouncedSearch])

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    const resetFilters = {
      searchTerm: '',
      statusFilter: 'all',
      typeFilter: 'all',
      dateFilter: 'all',
      ...initialFilters
    }
    setFilters(resetFilters)
    
    if (onFiltersChange) {
      onFiltersChange(resetFilters)
    }
  }, [initialFilters, onFiltersChange])

  // Fonction pour appliquer un filtre immédiatement (sans debounce)
  const applyFilter = useCallback((key: keyof FilterState, value: string) => {
    updateFilters({ [key]: value })
  }, [updateFilters])

  return {
    filters,
    isLoading,
    setIsLoading,
    updateFilters,
    updateSearch,
    applyFilter,
    resetFilters
  }
}
