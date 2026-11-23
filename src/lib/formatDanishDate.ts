/** Format an ISO date (`2025-06-14`) as `d. 14. juni 2025` for the
 *  Soft Wedding card's availability hint. Returns `undefined` when
 *  no date is selected so callers can omit the hint and let the CTA
 *  own the full footer. */
export function formatDanishDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `d. ${d.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}
