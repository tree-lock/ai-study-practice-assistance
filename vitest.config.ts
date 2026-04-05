import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    env: {
      DATABASE_URL:
        "postgresql://postgres:password@localhost:5432/practice_db_test",
      AUTH_SECRET: "test-auth-secret-for-vitest-only-32chars",
    },
  },
});
