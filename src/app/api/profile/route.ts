import { handler, ok } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateProfile } from "@/lib/repos/profiles";
import { readJson, str, optionalStr } from "@/lib/validate";

export const GET = handler(async () => {
  const { profile, email } = await requireUser();
  return ok({ ...profile, email });
});

export const PUT = handler(async (req: Request) => {
  const { userId } = await requireUser();
  const b = await readJson(req);
  const profile = await updateProfile(userId, {
    first_name: str(b.first_name, "First name", { max: 80 }),
    last_name: str(b.last_name, "Last name", { max: 80 }),
    phone: optionalStr(b.phone, 40),
    address1: optionalStr(b.address1, 200),
    address2: optionalStr(b.address2, 200),
    country: optionalStr(b.country, 80),
    state: optionalStr(b.state, 80),
    postal_code: optionalStr(b.postal_code, 20),
    date_of_birth: optionalStr(b.date_of_birth, 20),
  });
  return ok(profile);
});
