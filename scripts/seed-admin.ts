/**
 * Promote (or create) an admin user.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret \
 *     npx tsx scripts/seed-admin.ts
 *
 * If the user already exists, only the role is set to 'admin'.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey || !email) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or ADMIN_EMAIL");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  let userId = await findUserByEmail(email!);
  if (userId) {
    console.log(`User exists: ${email} (${userId})`);
    if (password) {
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) throw error;
      console.log("Password reset.");
    }
  } else {
    if (!password) {
      console.error("User does not exist and no ADMIN_PASSWORD provided to create one.");
      process.exit(1);
    }
    const { data, error } = await admin.auth.admin.createUser({
      email: email!,
      password,
      email_confirm: true,
      user_metadata: { full_name: "DJConnect Admin", role: "admin" },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created user: ${email} (${userId})`);
  }

  const { error: profErr } = await admin.from("profiles").upsert(
    { id: userId, role: "admin", email: email!, full_name: "DJConnect Admin" },
    { onConflict: "id" },
  );
  if (profErr) throw profErr;
  console.log(`Set role=admin for ${email}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
