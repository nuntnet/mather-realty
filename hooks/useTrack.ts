"use client";
import { useEffect, useRef } from "react";

type EventType = "car_view" | "booking" | "contact" | "search";

export function useTrackEvent(
  event: EventType,
  data: { path?: string; brand?: string; model?: string },
  enabled = true
) {
  const fired = useRef(false);
  useEffect(() => {
    if (!enabled || fired.current) return;
    fired.current = true;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...data }),
    }).catch(() => {});
  }, [enabled]);
}

export function track(event: EventType, data: { path?: string; brand?: string; model?: string; meta?: Record<string, string> }) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, ...data }),
  }).catch(() => {});
}
