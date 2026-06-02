"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Storage key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "doublen_saved";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSavedListings {
  saved: string[];
  toggle: (id: string) => void;
  isSaved: (id: string) => boolean;
  count: number;
}

export function useSavedListings(): UseSavedListings {
  const [saved, setSaved] = useState<string[]>([]);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as string[]);
    } catch {
      // ignore parse errors
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage full — still update state
      }
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved, count: saved.length };
}

// ─── Context (optional global access) ────────────────────────────────────────

const SavedContext = createContext<UseSavedListings | null>(null);

export function SavedListingsProvider({ children }: { children: React.ReactNode }) {
  const value = useSavedListings();
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSavedContext(): UseSavedListings {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSavedContext must be used inside SavedListingsProvider");
  return ctx;
}

// ─── SaveButton component ─────────────────────────────────────────────────────

interface SaveButtonProps {
  propertyId: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  showLabel?: boolean;
}

export function SaveButton({
  propertyId,
  className,
  size = "icon",
  showLabel = false,
}: SaveButtonProps) {
  const { isSaved, toggle } = useSavedListings();
  const saved = isSaved(propertyId);

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
      }}
      className={cn(
        "transition-colors",
        saved
          ? "text-rose-500 hover:text-rose-600"
          : "text-muted-foreground hover:text-rose-500",
        className
      )}
      aria-label={saved ? "Unsave listing" : "Save listing"}
      aria-pressed={saved}
    >
      <Heart
        className={cn("h-4 w-4 transition-all", saved && "fill-current")}
      />
      {showLabel && (
        <span className="ml-1.5 text-sm">{saved ? "Saved" : "Save"}</span>
      )}
    </Button>
  );
}

// ─── Saved listings list panel ────────────────────────────────────────────────

interface SavedListingsPanelProps {
  className?: string;
}

export default function SavedListingsPanel({ className }: SavedListingsPanelProps) {
  const { saved, toggle } = useSavedListings();

  if (saved.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Heart className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No saved listings yet.</p>
        <p className="text-xs mt-1">Tap the heart on any property to save it.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-muted-foreground">
        {saved.length} saved {saved.length === 1 ? "listing" : "listings"}
      </p>
      <ul className="space-y-1">
        {saved.map((id) => (
          <li
            key={id}
            className="flex items-center justify-between rounded-lg border px-3 py-2 bg-card"
          >
            <span className="text-sm font-mono text-muted-foreground truncate mr-2">
              {id}
            </span>
            <button
              type="button"
              onClick={() => toggle(id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              aria-label="Remove saved listing"
            >
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
