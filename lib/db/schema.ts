import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const agentMessageRoleEnum = pgEnum("agent_message_role", [
  "user",
  "assistant",
  "system",
]);

// Auth.js Tables
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  /** Scrypt hash for email+password login; null for OAuth-only users */
  passwordHash: text("passwordHash"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ],
);

/** Latest email OTP per mailbox (login / register); replaced on each send */
export const emailOtps = pgTable(
  "email_otp",
  {
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    salt: text("salt").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("email_otp_email_unique").on(t.email)],
);

/** One row per send; used for cooldown and daily caps */
export const emailOtpSendLogs = pgTable(
  "email_otp_send_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("email_otp_send_log_email_created_idx").on(t.email, t.createdAt),
  ],
);

// Agent tasks (conversation threads)
export const agentTasks = pgTable("agent_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("新任务"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentMessages = pgTable(
  "agent_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => agentTasks.id, { onDelete: "cascade" }),
    role: agentMessageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    /** UIMessage.id from the client; used to dedupe persisted user turns */
    clientMessageId: text("client_message_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("agent_messages_task_client_msg").on(
      t.taskId,
      t.clientMessageId,
    ),
  ],
);
