export const DJ_GUIDE_KEY = "djconnect.djGuide.completedAt";

export function isDJGuideCompleted(): boolean {
  try {
    return Boolean(localStorage.getItem(DJ_GUIDE_KEY));
  } catch {
    return false;
  }
}

export function markDJGuideCompleted(): void {
  try {
    localStorage.setItem(DJ_GUIDE_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function resetDJGuide(): void {
  try {
    localStorage.removeItem(DJ_GUIDE_KEY);
  } catch {
    /* ignore */
  }
}
