import { db } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { ok, badRequest, serverError } from "@/lib/api/response";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Email and password are required");
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return badRequest("Invalid email or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return badRequest("Invalid email or password");
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cafeId: user.cafeId,
    };

    const token = await createSession(sessionUser);
    await setSessionCookie(token);

    return ok({ user: sessionUser });
  } catch (error) {
    return serverError(error);
  }
}
