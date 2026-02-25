import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db, getDb } from "@/lib/db";
import { topics } from "@/lib/db/schema";

const hasGoogleAuthConfig =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

const providers = hasGoogleAuthConfig
  ? [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID ?? "",
        clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      }),
    ]
  : [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(getDb()),
  session: { strategy: "database" },
  providers,
  pages: {
    signIn: "/login",
  },
  events: {
    createUser: async ({ user }) => {
      await db.insert(topics).values({
        name: "默认题库",
        userId: user.id,
        isDefault: true,
      });
    },
  },
});
