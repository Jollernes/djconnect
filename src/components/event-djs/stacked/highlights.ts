import type { DJProfileWithRelations } from "@/types/domain";

/**
 * Returns up to 3 short, scannable lines per DJ derived from existing
 * mock fields. Used by the stacked card variants to make each card feel
 * like a real profile rather than a skeleton.
 *
 * Order (when available):
 *   1. Track record  — events_performed + years_experience
 *   2. Senest spillet — first item from notable_clients
 *   3. Setup         — first clause from equipment_description
 */
export function deriveHighlights(dj: DJProfileWithRelations): string[] {
  const lines: string[] = [];

  if (dj.events_performed && dj.years_experience) {
    lines.push(`${dj.events_performed} events · ${dj.years_experience} års erfaring`);
  } else if (dj.events_performed) {
    lines.push(`${dj.events_performed} events afholdt`);
  } else if (dj.years_experience) {
    lines.push(`${dj.years_experience} års erfaring`);
  }

  if (dj.notable_clients) {
    const first = dj.notable_clients
      .split(/[,·•]/)
      .map((s) => s.trim())
      .filter(Boolean)[0];
    if (first) lines.push(`Senest: ${first}`);
  }

  if (dj.equipment_description) {
    const first = dj.equipment_description
      .split(/[,·•]/)
      .map((s) => s.trim())
      .filter(Boolean)[0];
    if (first) lines.push(first);
  }

  return lines.slice(0, 3);
}
