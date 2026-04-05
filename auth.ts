import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authorizeEmailCredentials } from "@/lib/auth/authorize-email-credentials";
import { getDb } from "@/lib/db";

const hasGoogleAuthConfig =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

const emailCredentials = Credentials({
  id: "credentials",
  name: "邮箱",
  credentials: {
    email: { label: "邮箱", type: "email" },
    password: { label: "密码", type: "password" },
    code: { label: "验证码", type: "text" },
  },
  authorize: async (c) => authorizeEmailCredentials(c),
});

const providers = [
  emailCredentials,
  ...(hasGoogleAuthConfig
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID ?? "",
          clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
        }),
      ]
    : []),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(getDb()),
  /**
   * Credentials 登录在 @auth/core 里固定走 JWT 写入 cookie；若此处用 database，
   * /api/auth/session 会把 cookie 当 DB sessionToken 查表，永远对不上，表现为「登录未生效」。
   * OAuth 仍可用 adapter 落库用户/账号，会话走 JWT。
   */
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user, token }) {
      if (session.user) {
        if (user) {
          session.user.id = user.id;
        } else if (token?.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
});
