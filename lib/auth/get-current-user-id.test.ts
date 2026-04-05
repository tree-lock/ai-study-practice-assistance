import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

import { getCurrentUserId } from "@/lib/auth/get-current-user-id";

describe("getCurrentUserId", () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  it("未登录时应返回 null", async () => {
    mockAuth.mockResolvedValue(null);

    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
  });

  it("session 无 user 时应返回 null", async () => {
    mockAuth.mockResolvedValue({});

    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
  });

  it("session.user.id 存在时应返回该 id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", email: "a@b.c" } });

    const userId = await getCurrentUserId();

    expect(userId).toBe("user-1");
  });

  it("session.user.id 为空字符串时应返回 null", async () => {
    mockAuth.mockResolvedValue({ user: { id: "" } });

    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
  });
});
