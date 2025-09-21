const REDDIT_APP_ID_STORAGE_KEY = 'reddit_app_id';

let cachedPixelId: string | null | undefined;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface AppConfigCandidate {
  REDDIT_PIXEL_ID?: unknown;
}

function getWindowLike(): (Window & { __APP_CONFIG__?: AppConfigCandidate }) | (AppConfigCandidate & { localStorage?: StorageLike }) | undefined {
  if (typeof window !== 'undefined') {
    return window as Window & { __APP_CONFIG__?: AppConfigCandidate };
  }

  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined') {
    return (globalThis as any).window as Window & { __APP_CONFIG__?: AppConfigCandidate };
  }

  if (typeof globalThis !== 'undefined') {
    return globalThis as AppConfigCandidate & { localStorage?: StorageLike };
  }

  return undefined;
}

function normalizePixelId(candidate: unknown): string | null {
  if (typeof candidate !== 'string') return null;
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readFromLocalStorage(): string | null {
  const win = getWindowLike();
  if (!win || typeof win.localStorage === 'undefined') {
    return null;
  }

  try {
    const value = (win.localStorage as StorageLike).getItem(REDDIT_APP_ID_STORAGE_KEY);
    return normalizePixelId(value ?? undefined);
  } catch (_error) {
    return null;
  }
}

function readFromAppConfig(): string | null {
  const win = getWindowLike();
  const candidateConfig: AppConfigCandidate | undefined = win && (win as any).__APP_CONFIG__
    ? (win as any).__APP_CONFIG__
    : typeof globalThis !== 'undefined'
      ? ((globalThis as any).__APP_CONFIG__ as AppConfigCandidate | undefined)
      : undefined;

  if (!candidateConfig) return null;
  return normalizePixelId(candidateConfig.REDDIT_PIXEL_ID);
}

function persistPixelId(pixelId: string): void {
  const win = getWindowLike();
  if (!win || typeof win.localStorage === 'undefined') {
    return;
  }

  try {
    (win.localStorage as StorageLike).setItem(REDDIT_APP_ID_STORAGE_KEY, pixelId);
  } catch (_error) {
    // Ignore persistence errors (e.g., storage disabled)
  }
}

export function getConfiguredRedditPixelId(): string | null {
  if (cachedPixelId !== undefined) {
    return cachedPixelId;
  }

  const fromStorage = readFromLocalStorage();
  if (fromStorage) {
    cachedPixelId = fromStorage;
    return cachedPixelId;
  }

  const fromConfig = readFromAppConfig();
  if (fromConfig) {
    persistPixelId(fromConfig);
    cachedPixelId = fromConfig;
    return cachedPixelId;
  }

  cachedPixelId = null;
  return cachedPixelId;
}

export function __unsafeResetRedditPixelConfigCacheForTests(): void {
  cachedPixelId = undefined;
}
