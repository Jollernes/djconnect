import { PACKAGE_RECOMMENDATION_THRESHOLDS } from "@/lib/constants";
import { BRIEF_EVENT_TYPE_CONFIGS, normalizeBriefEventType } from "@/lib/eventTypes";
import { formatDKK } from "@/lib/utils";
import { SEED_PACKAGES, SEED_DJS, getAvailability } from "@/data/seed";
import type { DJ, EventBrief, Package, ProposalDJ, Region } from "@/types/domain";

const GUEST_COUNT_APPROXIMATION: Record<string, number> = {
  "Under 50": 40,
  "50-80": 65,
  "80-150": 115,
  "150-250": 200,
  "250-350": 300,
  "350+": 420,
};

function normalizeGuests(guestCountRange: string) {
  return GUEST_COUNT_APPROXIMATION[guestCountRange] ?? 100;
}

function regionMatches(eventRegion: Region, djRegions: Region[]) {
  return djRegions.includes("Hele Danmark / andet") || djRegions.includes(eventRegion);
}

function eventTypeMatches(brief: EventBrief, dj: DJ) {
  const normalizedEventType = normalizeBriefEventType(brief.event_type);
  const matchingTypes = BRIEF_EVENT_TYPE_CONFIGS[normalizedEventType].matchingEventTypes;
  return dj.event_type_focuses?.some((eventType) => matchingTypes.includes(eventType)) ?? false;
}

function vibeOverlap(brief: EventBrief, dj: DJ) {
  return brief.music_vibe_tags.filter((tag) => dj.vibe_tags.includes(tag)).length;
}

function languageMatch(brief: EventBrief, dj: DJ) {
  if (brief.language_preference === "Begge") {
    return dj.languages.includes("Dansk") && dj.languages.includes("Engelsk");
  }
  return dj.languages.includes(brief.language_preference);
}

function yesNoIsTrue(value: string) {
  return value === "Ja";
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hasLargeTechnicalNeed(brief: EventBrief) {
  const required = [brief.needs_sound, brief.needs_lighting, brief.needs_microphone].filter(yesNoIsTrue).length;
  return required >= 3 || brief.guest_count_range === "350+";
}

export function needsCustom(brief: EventBrief) {
  return normalizeGuests(brief.guest_count_range) > PACKAGE_RECOMMENDATION_THRESHOLDS.customMinGuests - 1 || hasLargeTechnicalNeed(brief);
}

export function recommendPackage(brief: EventBrief, packages: Package[] = SEED_PACKAGES): Package {
  const guests = normalizeGuests(brief.guest_count_range);
  const dinnerAndParty = brief.event_type === "Middag og efterfest" || yesNoIsTrue(brief.needs_dinner_music);
  const largeTechnical = hasLargeTechnicalNeed(brief);

  if (guests > 350 || largeTechnical) {
    return packages.find((pkg) => pkg.slug === "stor-firmafest") ?? packages[packages.length - 1];
  }

  if (guests >= PACKAGE_RECOMMENDATION_THRESHOLDS.dinnerPartyMinGuests && guests <= PACKAGE_RECOMMENDATION_THRESHOLDS.dinnerPartyMaxGuests) {
    return packages.find((pkg) => pkg.slug === "dinner-party") ?? packages[1];
  }

  if (dinnerAndParty) {
    return packages.find((pkg) => pkg.slug === "dinner-party") ?? packages[1];
  }

  if (guests > PACKAGE_RECOMMENDATION_THRESHOLDS.largeMinGuests) {
    return packages.find((pkg) => pkg.slug === "stor-firmafest") ?? packages[2];
  }

  return packages.find((pkg) => pkg.slug === "kompakt-firmafest") ?? packages[0];
}

export function availabilityFreshness(dj: DJ) {
  const updatedAt = new Date(dj.last_availability_update).getTime();
  const diffDays = Math.max(0, Math.floor((Date.now() - updatedAt) / (24 * 60 * 60 * 1000)));
  if (diffDays <= 3) {
    return { score: 100, isStale: false, tooStale: false };
  }
  if (diffDays <= 7) {
    return { score: 94, isStale: false, tooStale: false };
  }
  if (diffDays <= 14) {
    return { score: 84, isStale: true, tooStale: false };
  }
  if (diffDays <= 21) {
    return { score: 70, isStale: true, tooStale: false };
  }
  if (diffDays <= 30) {
    return { score: 56, isStale: true, tooStale: false };
  }
  return { score: 34, isStale: true, tooStale: true };
}

export function buildMatchReasons(brief: EventBrief, dj: DJ): string[] {
  const guests = normalizeGuests(brief.guest_count_range);
  const primaryVibe = brief.music_vibe_tags[0] ?? "arrangementet";
  const reasons = [
    `Passer til ${brief.guest_count_range.toLowerCase()} gæster`,
    regionMatches(brief.region, dj.regions) ? `Dækker ${brief.region.toLowerCase()}` : undefined,
    eventTypeMatches(brief, dj) ? `Erfaring med ${brief.event_type.toLowerCase()}` : undefined,
    vibeOverlap(brief, dj) > 0 ? `Matcher ${primaryVibe.toLowerCase()}` : undefined,
    languageMatch(brief, dj) ? `Kommunikerer godt på ${brief.language_preference.toLowerCase()}` : undefined,
    yesNoIsTrue(brief.needs_microphone) && dj.can_handle_speeches ? "Mikrofon til taler inkluderet" : undefined,
    yesNoIsTrue(brief.needs_dinner_music) ? "Velegnet til middag og efterfølgende dansegulv" : undefined,
    dj.corporate_experience_years >= 10 ? `Mere end ${dj.corporate_experience_years} års corporate-erfaring` : undefined,
    dj.equipment_sound && yesNoIsTrue(brief.needs_sound) ? "Lyd tilpasset virksomhedsarrangementer" : undefined,
    dj.equipment_lighting && yesNoIsTrue(brief.needs_lighting) ? "Dansegulvslys er en del af løsningen" : undefined,
  ].filter((reason): reason is string => Boolean(reason));

  if (brief.event_type === "Julefrokost" && !reasons.some((reason) => reason.includes("julefrokost"))) {
    reasons.push("Matcher julefrokost-stemning");
  }

  if (guests >= 160) {
    reasons.push(`Stærk til events omkring ${brief.guest_count_range.toLowerCase()}`);
  }

  return reasons.slice(0, 5);
}

export function shortlistDJs(brief: EventBrief, djs: DJ[] = SEED_DJS): ProposalDJ[] {
  return djs
    .filter((dj) => dj.approved_for_shortlist)
    .filter((dj) => dj.status === "approved")
    .filter((dj) => {
      const availability = getAvailability(dj.id, brief.event_date);
      return availability === "available" || availability === "tentative";
    })
    .filter((dj) => regionMatches(brief.region, dj.regions))
    .filter((dj) => dj.profile_quality_score >= 80)
    .filter((dj) => !availabilityFreshness(dj).tooStale)
    .map((dj) => {
      const freshness = availabilityFreshness(dj);
      const guests = normalizeGuests(brief.guest_count_range);
      const regionScore = regionMatches(brief.region, dj.regions) ? 14 : 0;
      const eventScore = eventTypeMatches(brief, dj) ? 10 : 0;
      const vibeScore = Math.min(10, vibeOverlap(brief, dj) * 4);
      const languageScore = languageMatch(brief, dj) ? 8 : brief.language_preference === "Begge" ? 10 : 0;
      const corporateScore = Math.min(10, Math.floor(dj.corporate_experience_years / 2));
      const speechScore = yesNoIsTrue(brief.needs_microphone) && dj.can_handle_speeches ? 6 : 0;
      const dinnerScore = yesNoIsTrue(brief.needs_dinner_music) ? (dj.event_type_focuses?.includes("Middag og efterfest") ? 6 : 3) : 0;
      const equipmentScore = (yesNoIsTrue(brief.needs_sound) && dj.equipment_sound ? 4 : 0) + (yesNoIsTrue(brief.needs_lighting) && dj.equipment_lighting ? 4 : 0);
      const reliabilityScore = Math.round((dj.reliability_score / 100) * 8);
      const freshnessScore = Math.round((freshness.score / 100) * 6);
      const guestFitScore = guests >= 160 && dj.roster_layer === "core" ? 5 : guests < 80 && dj.roster_layer === "extended" ? 2 : 4;
      const rawScore =
        regionScore +
        eventScore +
        vibeScore +
        languageScore +
        corporateScore +
        speechScore +
        dinnerScore +
        equipmentScore +
        reliabilityScore +
        freshnessScore +
        guestFitScore;
      const jitter = (hashSeed(`${dj.id}_${brief.event_date}_${brief.event_type}`) % 7) - 3;
      const matchScore = Math.max(88, Math.min(98, 88 + Math.round(rawScore / 6) + jitter));
      return {
        dj_id: dj.id,
        match_score: matchScore,
        match_reasons: buildMatchReasons(brief, dj),
        is_platform_recommended: false,
        display_order: 0,
        hold_status: "none" as const,
        _dj: dj,
        _freshness: freshness,
      };
    })
    .sort((a, b) => b.match_score - a.match_score || b._dj.profile_quality_score - a._dj.profile_quality_score || a._freshness.score - b._freshness.score)
    .slice(0, 3)
    .map((item, index) => ({
      dj_id: item.dj_id,
      match_score: item.match_score,
      match_reasons: item.match_reasons,
      is_platform_recommended: index === 0,
      display_order: index + 1,
      hold_status: index === 0 ? "provisional" : "none",
    }));
}

export function describeRecommendation(brief: EventBrief, packages: Package[] = SEED_PACKAGES) {
  const recommended = recommendPackage(brief, packages);
  return `${recommended.name} fra ${formatDKK(recommended.price_from)}`;
}
