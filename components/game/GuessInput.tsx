"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
} from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Track } from "@/lib/music/types";

interface GuessInputProps {
  onSubmit: (songId: string, title: string, artist: string) => void;
  onSkip: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  language?: string;
}

export function GuessInput({ onSubmit, onSkip, language, disabled = false, isSubmitting = false }: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selected, setSelected] = useState<Track | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const comboboxId = useId();
  const listboxId = `${comboboxId}-listbox`;

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(q)}${language && language !== "all" ? `&language=${encodeURIComponent(language)}` : ""}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json() as { tracks: Track[] };
      setResults(data.tracks);
      setIsOpen(data.tracks.length > 0);
      setActiveIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [language]);

  useEffect(() => {
    if (selected) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void search(query);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, search, selected, language]);

  const selectTrack = useCallback(
    (track: Track) => {
      setSelected(track);
      setQuery(`${track.title} — ${track.artist}`);
      setIsOpen(false);
      setResults([]);
      setActiveIndex(-1);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!selected) {
      inputRef.current?.focus();
      return;
    }
    if (disabled || isSubmitting) return;
    onSubmit(selected.id, selected.title, selected.artist);
    setSelected(null);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }, [selected, disabled, isSubmitting, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          const track = results[activeIndex];
          if (track) selectTrack(track);
        } else if (selected) {
          handleSubmit();
        }
      }
    },
    [isOpen, activeIndex, results, selected, selectTrack, handleSubmit]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelected(null);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const isDisabled = disabled || isSubmitting;

  return (
    <div className="w-full flex flex-col sm:flex-row gap-2 relative z-50">
      {/* Combobox input */}
      <div className="relative flex-grow">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder="Search for a song..."
            className="w-full h-12 sm:h-14 pl-12 pr-10 rounded-xl border bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 transition-shadow"
          />
          {isSearching && (
            <div className="absolute right-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {isOpen && results.length > 0 && (
            <motion.ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 top-full mt-2 w-full max-h-64 overflow-y-auto",
                "bg-popover border rounded-xl shadow-xl py-2"
              )}
            >
              {results.map((track, index) => (
                <li
                  key={track.id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  onClick={() => selectTrack(track)}
                  className={cn(
                    "px-4 py-3 cursor-pointer text-base transition-colors",
                    activeIndex === index || selected?.id === track.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="font-medium truncate">{track.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 shrink-0 h-12 sm:h-14">
        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isDisabled && selected !== null}
          className={cn(
            "flex-grow sm:flex-grow-0 sm:w-36 flex items-center justify-center px-4 rounded-xl font-semibold text-base transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            selected 
              ? "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600"
              : "bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-primary",
            (isDisabled && selected !== null) ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
          ) : selected ? (
            "Guess"
          ) : (
            "Search"
          )}
        </button>

        {/* Skip button */}
        <button
          onClick={onSkip}
          disabled={isDisabled}
          className="flex-grow sm:flex-grow-0 sm:w-24 flex items-center justify-center px-4 rounded-xl border bg-background hover:bg-accent font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
