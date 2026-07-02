import { handler, created, fail } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAuthClient } from "@/lib/supabase/server";
import { createProfile } from "@/lib/repos/profiles";
import { readJson, str, email as parseEmail, optionalStr } from "@/lib/validate";

export const POST = handler(async (req: Request) => {
  const b = await readJson(req);
  const email = parseEmail(b.email);
  const password = str(b.password, "Password", { min: 8, max: 100 });
  const firstName = str(b.first_name, "First name", { max: 80 });
  const lastName = str(b.last_name, "Last name", { max: 80 });

  const admin = createAdminClient();

  // 1. Create the auth user (email confirmed so they can sign in immediately).
  const { data: createdUser, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr || !createdUser.user) {
    return fail(400, authErr?.message.includes("already") ? "An account with this email already exists" : "Could not create account");
  }
  const userId = createdUser.user.id;

  // 2. Create the profile. Roll back the auth user if this fails.
  try {
    await createProfile(userId, {
      first_name: firstName,
      last_name: lastName,
      phone: optionalStr(b.phone, 40),
      address1: optionalStr(b.address1, 200),
      address2: optionalStr(b.address2, 200),
      country: optionalStr(b.country, 80),
      state: optionalStr(b.state, 80),
      postal_code: optionalStr(b.postal_code, 20),
      date_of_birth: optionalStr(b.date_of_birth, 20),
    });
  } catch (err) {
    await admin.auth.admin.deleteUser(userId);
    throw err;
  }

  // 3. Sign them in (sets the session cookie).
  const auth = await createAuthClient();
  await auth.auth.signInWithPassword({ email, password });

  return created({ id: userId, email });
});
