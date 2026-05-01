import type { Profile } from "@/types/domain";

export type CustomerType = "private" | "corporate";

/**
 * A customer is "corporate" if they have a company affiliation
 * (set via signup or company_name field on their profile).
 * Otherwise they're a "private" individual booking a one-off event
 * (wedding, birthday, private party, etc.).
 */
export function getCustomerType(profile: Profile | null | undefined): CustomerType {
  if (!profile) return "private";
  return profile.company_name && profile.company_name.trim().length > 0
    ? "corporate"
    : "private";
}
