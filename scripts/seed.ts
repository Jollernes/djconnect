/**
 * Seed script: populates a real Supabase project with the mock DJ catalogue
 * so the platform is browsable while testing.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SEED_DJ_PASSWORD=... \
 *     npx tsx scripts/seed.ts
 *
 * Idempotent-ish: skips DJ auth users that already exist (matched by email).
 */
import { createClient } from "@supabase/supabase-js";
import { mockDJs } from "../src/data/mock";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const djPassword = process.env.SEED_DJ_PASSWORD ?? "DJConnect2025!";

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email: string): Promise<string | null> {
  // paginate through users (small dataset)
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function seedDJ(dj: (typeof mockDJs)[number]) {
  const p = dj.profile;
  const email = p.email;

  let userId = await findUserByEmail(email);
  if (userId) {
    console.log(`  user exists: ${email} (${userId})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: djPassword,
      email_confirm: true,
      user_metadata: { full_name: p.full_name, role: "dj" },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`  created user: ${email} (${userId})`);
  }

  // profile (upsert)
  const { error: profErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      role: "dj",
      email,
      full_name: p.full_name,
      phone: p.phone,
      avatar_url: p.avatar_url,
      city: p.city,
      country: p.country,
      company_name: p.company_name,
    },
    { onConflict: "id" },
  );
  if (profErr) throw profErr;

  // dj_profile (upsert on user_id)
  const { data: djRow, error: djErr } = await admin
    .from("dj_profiles")
    .upsert(
      {
        user_id: userId,
        username: dj.username,
        stage_name: dj.stage_name,
        tagline: dj.tagline,
        bio: dj.bio,
        years_experience: dj.years_experience,
        events_performed: dj.events_performed,
        notable_clients: dj.notable_clients,
        equipment_description: dj.equipment_description,
        setup_size: dj.setup_size,
        travel_radius_km: dj.travel_radius_km,
        base_location: dj.base_location,
        price_from_minor: dj.price_from_minor,
        price_on_request: dj.price_on_request,
        currency: dj.currency,
        verification_status: dj.verification_status,
        is_featured: dj.is_featured,
        rating_average: dj.rating_average,
        rating_count: dj.rating_count,
        submitted_at: dj.submitted_at,
        approved_at: dj.approved_at,
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();
  if (djErr) throw djErr;
  const djProfileId = djRow.id as string;

  // event types
  await admin.from("dj_event_types").delete().eq("dj_profile_id", djProfileId);
  const etRows = dj.event_types.map((et) => ({
    dj_profile_id: djProfileId,
    event_type_id: et!.id,
  }));
  if (etRows.length) {
    const { error: etErr } = await admin.from("dj_event_types").insert(etRows);
    if (etErr) throw etErr;
  }

  // equipment photos
  await admin.from("dj_equipment_photos").delete().eq("dj_profile_id", djProfileId);
  const photoRows = dj.equipment_photos.map((ph, i) => ({
    dj_profile_id: djProfileId,
    storage_path: ph.storage_path || `seed/${dj.username}/${i}`,
    url: ph.url,
    sort_order: ph.sort_order,
  }));
  if (photoRows.length) {
    const { error: phErr } = await admin.from("dj_equipment_photos").insert(photoRows);
    if (phErr) throw phErr;
  }

  console.log(`  seeded dj_profile ${dj.stage_name} (${djProfileId}) with ${etRows.length} event types, ${photoRows.length} photos`);
}

async function main() {
  console.log(`Seeding ${mockDJs.length} DJs into ${url}`);
  for (const dj of mockDJs) {
    console.log(`- ${dj.stage_name}`);
    await seedDJ(dj);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
