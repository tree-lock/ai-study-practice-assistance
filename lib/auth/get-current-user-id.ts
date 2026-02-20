import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";

async function getSessionToken() {
  const cookieStore = await cookies();

  return (
    cookieStore.get("authjs.session-token")?.value ??
    cookieStore.get("__Secure-authjs.session-token")?.value ??
    cookieStore.get("next-auth.session-token")?.value ??
    cookieStore.get("__Secure-next-auth.session-token")?.value ??
    null
  );
}

export async function getCurrentUserId() {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return null;
  }

  const records = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(
      and(
        eq(sessions.sessionToken, sessionToken),
        gt(sessions.expires, new Date()),
      ),
    )
    .limit(1);

  return records[0]?.userId ?? null;
}
