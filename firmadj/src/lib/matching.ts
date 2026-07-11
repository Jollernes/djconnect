'use server';

import { DJ, EventBrief, Package } from './types';
import { getDJs, getDJAvailabilityForDate } from './data';
import { parseGuestCount } from './format';

export async function recommendPackage(brief: EventBrief): Promise<{ packageId: string; reason: string; note?: string }> {
  const guests = parseGuestCount(brief.guest_count_range);
  const needsMic = brief.needs_microphone === 'Ja';
  const needsDinner = brief.needs_dinner_music === 'Ja';
  const isJulefrokost = brief.event_type === 'Julefrokost';
  const isLarge = guests.max >= 200;
  const isMedium = guests.max >= 80 && guests.max < 150;

  if (isLarge) {
    return { packageId: 'pkg-custom', reason: 'Custom / Enterprise', note: 'Større firmaevents kræver typisk en kort teknisk vurdering. I kan stadig sende briefen, og vi vender tilbage med den rette løsning.' };
  }

  if (guests.max > 150 || (needsMic && needsDinner && guests.max > 120)) {
    return { packageId: 'pkg-stor', reason: 'Større setup til 150-200 gæster og fuld teknisk koordinering.' };
  }

  if (isJulefrokost && isMedium) {
    return { packageId: 'pkg-dinner', reason: 'Julefrokost med middag, taler og dansegulv passer bedst til Dinner & Party.' };
  }

  if (needsMic || needsDinner || (isMedium && guests.max >= 80)) {
    return { packageId: 'pkg-dinner', reason: 'Dinner & Party dækker middag, taler og dansegulv for 80-150 gæster.' };
  }

  if (guests.max <= 80) {
    return { packageId: 'pkg-kompakt', reason: 'Kompakt løsning til mindre firmaevents op til 80 gæster.' };
  }

  return { packageId: 'pkg-dinner', reason: 'Dinner & Party er vores mest fleksible løsning.' };
}

export async function matchDJs(brief: EventBrief): Promise<{ dj: DJ; score: number; reasons: string[]; recommended: boolean }[]> {
  const guests = parseGuestCount(brief.guest_count_range);
  const djs = getDJs();
  const region = brief.region || 'Hele Danmark / andet';
  const neededCapacity = guests.max <= 80 ? 80 : guests.max <= 150 ? 150 : guests.max <= 200 ? 200 : 250;
  const needsMic = brief.needs_microphone === 'Ja';
  const needsDinner = brief.needs_dinner_music === 'Ja';
  const vibeTags = brief.music_vibe_tags || [];
  const language = brief.language_preference || 'Dansk';

  const matches = djs
    .filter((dj) => dj.status === 'approved')
    .filter((dj) => dj.approved_for_shortlist)
    .filter((dj) => {
      if (neededCapacity <= 80) return dj.can_deliver_80;
      if (neededCapacity <= 150) return dj.can_deliver_150;
      if (neededCapacity <= 200) return dj.can_deliver_200;
      return false;
    })
    .filter((dj) => (needsMic ? dj.can_handle_speeches : true))
    .filter((dj) => {
      if (!brief.event_date) return true;
      const avail = getDJAvailabilityForDate(dj.id, brief.event_date);
      return avail.status === 'available' || avail.status === 'tentative';
    })
    .map((dj) => {
      let score = 0;
      const reasons: string[] = [];

      const regionMatch = (dj.regions || []).includes(region) || (dj.regions || []).includes('Hele Danmark / andet');
      if (regionMatch) {
        score += 15;
        reasons.push(`Dækker ${dj.city || region}`);
      }

      if (dj.roster_layer === 'core') {
        score += 10;
        reasons.push('Kernenetværk');
      }

      const vibeOverlap = (dj.vibe_tags || []).filter((t) => vibeTags.includes(t));
      if (vibeOverlap.length) {
        score += vibeOverlap.length * 12;
        reasons.push('Matcher musikprofil');
      }

      const langMatch = (dj.languages || []).includes(language) || language === 'Begge';
      if (langMatch) {
        score += 8;
        reasons.push('Passer sprogvalg');
      }

      if (needsMic && dj.can_handle_speeches) {
        score += 10;
        reasons.push('Mikrofon og taler');
      }

      if (needsDinner && dj.specialties?.some((s) => s.toLowerCase().includes('middag') || s.toLowerCase().includes('baggrund'))) {
        score += 8;
        reasons.push('Middag/baggrundsmusik');
      }

      if (neededCapacity <= 80 && dj.can_deliver_80) { score += 8; reasons.push('Passer til op til 80 gæster'); }
      if (neededCapacity <= 150 && dj.can_deliver_150) { score += 8; reasons.push('Passer til op til 150 gæster'); }
      if (neededCapacity <= 200 && dj.can_deliver_200) { score += 8; reasons.push('Passer til op til 200 gæster'); }

      score += (dj.corporate_experience_years || 0) * 2;
      score += (dj.reliability_score || 0) * 0.1;
      score += (dj.profile_quality_score || 0) * 0.1;
      score += (dj.availability_freshness_score || 0) * 0.05;

      score = Math.min(99, Math.round(score));

      return { dj, score, reasons: [...new Set(reasons)].slice(0, 3), recommended: false };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (matches.length > 0) matches[0].recommended = true;
  return matches;
}

export async function matchReasonsText(brief: EventBrief, pkg: Package): Promise<string[]> {
  const guests = parseGuestCount(brief.guest_count_range);
  const reasons: string[] = [];
  if (pkg.guest_max && guests.max <= pkg.guest_max && guests.min >= (pkg.guest_min || 0)) {
    reasons.push(`Passer til ${brief.guest_count_range} gæster`);
  }
  if (brief.needs_dinner_music === 'Ja') reasons.push('Middagsmusik inkluderet');
  if (brief.needs_microphone === 'Ja' && pkg.microphone_included) reasons.push('Mikrofon til taler inkluderet');
  if (pkg.sound_included) reasons.push('Lyd inkluderet');
  if (pkg.lighting_included) reasons.push('Lys inkluderet');
  if (pkg.technical_coordination_included) reasons.push('Teknisk koordinering inkluderet');
  if (brief.event_type === 'Julefrokost') reasons.push('Matcher julefrokost-stemning');
  if (brief.event_type === 'Sommerfest') reasons.push('Matcher sommerfest-stemning');
  return reasons.length ? reasons.slice(0, 5) : ['Passer til jeres arrangement'];
}
