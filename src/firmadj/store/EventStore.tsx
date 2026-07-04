import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { djs } from "@/firmadj/data/mock";
import type {
  CreateFirmaEventInput,
  FirmaCompany,
  FirmaEvent,
  FirmaPracticalInfo,
} from "@/firmadj/types";

interface EventStoreValue {
  events: Record<string, FirmaEvent>;
  createEvent: (draft: CreateFirmaEventInput) => string;
  getEvent: (id: string) => FirmaEvent | undefined;
  updateEvent: (id: string, patch: Partial<FirmaEvent>) => void;
  confirmEvent: (id: string, company: FirmaCompany) => void;
}

const storageKey = "firmadj:events";
const EventStoreContext = createContext<EventStoreValue | null>(null);

function pickDJIds(eventType: string): [string, string] {
  const normalized = eventType.toLowerCase();
  const genreWeights: Record<string, number> = {
    "house": 0,
    "top 40": 0,
    disco: 0,
    "80'er/90'er": 0,
    "hip-hop": 0,
    "nordisk pop": 0,
  };

  if (normalized.includes("julefrokost")) {
    genreWeights.disco += 4;
    genreWeights["80'er/90'er"] += 4;
    genreWeights["top 40"] += 3;
    genreWeights["nordisk pop"] += 2;
  } else if (normalized.includes("galla")) {
    genreWeights.house += 4;
    genreWeights.disco += 3;
    genreWeights["nordisk pop"] += 2;
  } else if (normalized.includes("sommer")) {
    genreWeights.house += 4;
    genreWeights.disco += 3;
    genreWeights["top 40"] += 3;
  } else {
    genreWeights["top 40"] += 3;
    genreWeights.disco += 2;
    genreWeights.house += 2;
  }

  const ranked = [...djs]
    .map((dj) => {
      const score = dj.genres.reduce((total, genre) => total + (genreWeights[genre.toLowerCase()] ?? 0), 0);
      return { dj, score };
    })
    .sort((left, right) => right.score - left.score || left.dj.stageName.localeCompare(right.dj.stageName));

  return [ranked[0]?.dj.id ?? djs[0].id, ranked[1]?.dj.id ?? djs[1].id];
}

function createShortId() {
  return (globalThis.crypto?.randomUUID?.() ?? `firmadj-${Date.now()}-${Math.random()}`)
    .replace(/-/g, "")
    .slice(0, 8);
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Record<string, FirmaEvent>>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as Record<string, FirmaEvent>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(events));
  }, [events]);

  const createEvent = useCallback((draft: CreateFirmaEventInput) => {
    const id = createShortId();
    const matchDJIds = pickDJIds(draft.eventType);

    setEvents((current) => ({
      ...current,
      [id]: {
        id,
        date: draft.date,
        guests: draft.guests,
        postalCode: draft.postalCode,
        eventType: draft.eventType,
        decibelLimiter: draft.decibelLimiter,
        packageId: draft.packageId,
        email: draft.email,
        status: draft.status ?? "Draft",
        selectedDJId: null,
        matchDJIds,
        price: draft.price,
      },
    }));

    return id;
  }, []);

  const getEvent = useCallback(
    (id: string) => events[id],
    [events],
  );

  const updateEvent = useCallback((id: string, patch: Partial<FirmaEvent>) => {
    setEvents((current) => {
      const existing = current[id];
      if (!existing) {
        return current;
      }

      const practicalInfo = patch.practicalInfo
        ? ({
            timeline: patch.practicalInfo.timeline ?? existing.practicalInfo?.timeline,
            parking: patch.practicalInfo.parking ?? existing.practicalInfo?.parking,
            doNotPlay: patch.practicalInfo.doNotPlay ?? existing.practicalInfo?.doNotPlay,
            wishes: patch.practicalInfo.wishes ?? existing.practicalInfo?.wishes,
          } satisfies FirmaPracticalInfo)
        : existing.practicalInfo;

      return {
        ...current,
        [id]: {
          ...existing,
          ...patch,
          practicalInfo,
        },
      };
    });
  }, []);

  const confirmEvent = useCallback((id: string, company: FirmaCompany) => {
    setEvents((current) => {
      const existing = current[id];
      if (!existing) {
        return current;
      }

      return {
        ...current,
        [id]: {
          ...existing,
          company,
          status: "Confirmed",
        },
      };
    });
  }, []);

  const value = useMemo<EventStoreValue>(
    () => ({ events, createEvent, getEvent, updateEvent, confirmEvent }),
    [confirmEvent, createEvent, events, getEvent, updateEvent],
  );

  return <EventStoreContext.Provider value={value}>{children}</EventStoreContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventStoreContext);
  if (!context) {
    throw new Error("useEvents must be used within EventProvider");
  }

  return context;
}
