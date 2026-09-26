import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Pill, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { GenericSuggestion } from '../types';

interface MedicineSearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearch?: (query: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

export const MedicineSearchBar: React.FC<MedicineSearchBarProps> = ({
  placeholder = 'Search medicine name or generic formula (e.g. Paracetamol, Metformin)...',
  initialValue = '',
  onSearch,
  className = '',
  size = 'md',
  autoFocus = false
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<GenericSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Sync when initialValue updates externally
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Fetch real-time matching generic name suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.medicines.suggestions(trimmed);
        if (!isCancelled) {
          setSuggestions(res);
          setIsOpen(res.length > 0);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error('Error fetching generic suggestions:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (genericName: string) => {
    setQuery(genericName);
    setIsOpen(false);
    if (onSearch) {
      onSearch(genericName);
    } else {
      navigate(`/medicines?q=${encodeURIComponent(genericName)}`);
    }
  };

  const handleSelectBrandMedicine = (brandName: string, medicineId: string) => {
    setIsOpen(false);
    navigate(`/medicines/${medicineId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelectSuggestion(suggestions[activeIndex].generic_name);
      return;
    }
    const targetQuery = query.trim();
    if (onSearch) {
      onSearch(targetQuery);
    } else {
      if (targetQuery) {
        navigate(`/medicines?q=${encodeURIComponent(targetQuery)}`);
      } else {
        navigate('/medicines');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[activeIndex].generic_name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    if (onSearch) onSearch('');
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2 px-3 text-sm',
    lg: 'py-3 px-4 text-base'
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5'
  }[size];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="flex items-center rounded-xl bg-white p-1.5 shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <Search className={`${iconSizes} text-slate-400 ml-2 shrink-0`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={e => {
              setQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            onFocus={() => {
              if (suggestions.length > 0 && query.trim()) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-expanded={isOpen}
            className={`w-full ${sizeClasses} text-slate-800 focus:outline-none placeholder:text-slate-400`}
          />

          {isLoading && (
            <div className="mr-2 shrink-0">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            Search
          </button>
        </div>
      </form>

      {/* Real-time Generic Names Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150"
          role="listbox"
        >
          {/* Header indicator */}
          <div className="px-3.5 py-2 bg-slate-50/80 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Pill className="w-3.5 h-3.5" />
              Generic Ingredients &amp; Formulas
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Press Enter or Click to view
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {suggestions.map((item, index) => {
              const isSelected = index === activeIndex;
              return (
                <div
                  key={item.generic_name}
                  className={`p-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                  onClick={() => handleSelectSuggestion(item.generic_name)}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {/* Generic Name with matched substring highlighted */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                          {(() => {
                            const trimmedQ = query.trim().toLowerCase();
                            const name = item.generic_name;
                            const idx = name.toLowerCase().indexOf(trimmedQ);
                            if (idx !== -1 && trimmedQ.length > 0) {
                              const before = name.slice(0, idx);
                              const match = name.slice(idx, idx + trimmedQ.length);
                              const after = name.slice(idx + trimmedQ.length);
                              return (
                                <span>
                                  {before}
                                  <mark className="bg-amber-100 text-amber-900 font-extrabold rounded-xs px-0.5">
                                    {match}
                                  </mark>
                                  {after}
                                </span>
                              );
                            }
                            return name;
                          })()}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 font-medium">
                          {item.count} {item.count === 1 ? 'brand option' : 'brand options'}
                        </span>
                      </div>

                      {/* Matching brand examples */}
                      {item.matching_medicines.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 pt-0.5">
                          <span className="text-slate-400 text-[11px]">Brands:</span>
                          {item.matching_medicines.slice(0, 3).map(med => (
                            <button
                              key={med.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectBrandMedicine(med.name, med.id);
                              }}
                              className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 px-1.5 py-0.5 rounded transition-colors"
                            >
                              {med.name}
                            </button>
                          ))}
                          {item.matching_medicines.length > 3 && (
                            <span className="text-[11px] text-slate-400">
                              +{item.matching_medicines.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center text-xs font-semibold text-blue-600 mt-1">
                      <span className="hidden sm:inline mr-1 text-[11px]">Browse</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick footer with safety note */}
          <div className="px-3.5 py-2 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Search for exact generic names to compare equivalent brands &amp; prices
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(`/medicines?q=${encodeURIComponent(query)}`);
              }}
              className="text-blue-600 hover:underline font-medium text-[11px]"
            >
              See all results &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
