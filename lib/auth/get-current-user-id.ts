import { auth } from "@/auth";

export async function getCurrentUserId() {
  const session = await auth();
  const id = session?.user?.id;
  if (typeof id === "string" && id.length > 0) {
    return id;
  }
  return null;
}
