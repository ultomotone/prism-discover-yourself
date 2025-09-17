import { useCallback, useMemo, useSyncExternalStore } from "react";

type LikesRecord = Record<string, number>;
type LikedRecord = Record<string, true>;

interface StoreState {
  counts: LikesRecord;
  liked: LikedRecord;
}

interface PersistedState {
  counts?: unknown;
  liked?: unknown;
}

const STORAGE_KEY = "typingLabLikes.v1";

const emptyState: StoreState = {
  counts: {},
  liked: {},
};

const listeners = new Set<() => void>();

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const normalizePersistedState = (raw: PersistedState): StoreState => {
  const counts: LikesRecord = {};
  const liked: LikedRecord = {};

  if (raw.counts && typeof raw.counts === "object" && raw.counts !== null) {
    for (const [key, value] of Object.entries(raw.counts)) {
      if (typeof key === "string" && isFiniteNumber(value)) {
        counts[key] = value;
      }
    }
  }

  if (Array.isArray(raw.liked)) {
    for (const entry of raw.liked) {
      if (typeof entry === "string" && entry) {
        liked[entry] = true;
      }
    }
  } else if (raw.liked && typeof raw.liked === "object") {
    for (const [key, value] of Object.entries(raw.liked as Record<string, unknown>)) {
      if (value && typeof key === "string" && key) {
        liked[key] = true;
      }
    }
  }

  return { counts, liked };
};

const readFromStorage = (): StoreState => {
  if (typeof window === "undefined") {
    return emptyState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyState;
    }

    const parsed: PersistedState = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return emptyState;
    }

    return normalizePersistedState(parsed);
  } catch (error) {
    console.warn("Failed to read typing lab likes from storage", error);
    return emptyState;
  }
};

let state: StoreState = readFromStorage();

const persistState = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload = JSON.stringify({
      counts: state.counts,
      liked: Object.keys(state.liked),
    });
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.warn("Failed to persist typing lab likes", error);
  }
};

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const setState = (next: StoreState) => {
  state = next;
  persistState();
  emit();
};

const incrementLike = (key: string) => {
  if (!key || state.liked[key]) {
    return;
  }

  const nextCounts: LikesRecord = { ...state.counts, [key]: (state.counts[key] ?? 0) + 1 };
  const nextLiked: LikedRecord = { ...state.liked, [key]: true };
  setState({ counts: nextCounts, liked: nextLiked });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;
const getServerSnapshot = () => emptyState;

export const useTypingLabLikes = () => {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const like = useCallback((key: string) => {
    incrementLike(key);
  }, []);

  const getLikesFor = useCallback(
    (key: string) => store.counts[key] ?? 0,
    [store.counts]
  );

  const hasLiked = useCallback(
    (key: string) => Boolean(store.liked[key]),
    [store.liked]
  );

  const totalLikes = useMemo(
    () => Object.values(store.counts).reduce((sum, value) => sum + value, 0),
    [store.counts]
  );

  return {
    like,
    getLikesFor,
    hasLiked,
    totalLikes,
  };
};

export const __typingLabLikesTestUtils = {
  reset() {
    setState(emptyState);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
};
