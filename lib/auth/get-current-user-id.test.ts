import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock, selectMock, fromMock, whereMock, limitMock } = vi.hoisted(
  () => {
    const localCookiesMock = vi.fn();
    const localLimitMock = vi.fn();
    const localWhereMock = vi.fn(() => ({ limit: localLimitMock }));
    const localFromMock = vi.fn(() => ({ where: localWhereMock }));
    const localSelectMock = vi.fn(() => ({ from: localFromMock }));

    return {
      cookiesMock: localCookiesMock,
      selectMock: localSelectMock,
      fromMock: localFromMock,
      whereMock: localWhereMock,
      limitMock: localLimitMock,
    };
  },
);

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: selectMock,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  sessions: {
    userId: "user_id_column",
    sessionToken: "session_token_column",
    expires: "expires_column",
  },
}));

import { getCurrentUserId } from "@/lib/auth/get-current-user-id";

function mockCookieStore(values: Record<string, string | undefined>) {
  cookiesMock.mockResolvedValue({
    get: vi.fn((name: string) => {
      const value = values[name];
      if (!value) {
        return undefined;
      }
      return { value };
    }),
  });
}

describe("getCurrentUserId", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    selectMock.mockClear();
    fromMock.mockClear();
    whereMock.mockClear();
    limitMock.mockReset();
  });

  it("没有任何会话 cookie 时应返回 null", async () => {
    mockCookieStore({});

    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("存在 authjs.session-token 且 session 有效时应返回 userId", async () => {
    mockCookieStore({
      "authjs.session-token": "token-1",
    });
    limitMock.mockResolvedValue([{ userId: "user-1" }]);

    const userId = await getCurrentUserId();

    expect(selectMock).toHaveBeenCalledWith({ userId: "user_id_column" });
    expect(limitMock).toHaveBeenCalledWith(1);
    expect(userId).toBe("user-1");
  });

  it("使用 __Secure-next-auth.session-token 兜底时也应正常工作", async () => {
    mockCookieStore({
      "__Secure-next-auth.session-token": "secure-token",
    });
    limitMock.mockResolvedValue([{ userId: "user-2" }]);

    const userId = await getCurrentUserId();

    expect(limitMock).toHaveBeenCalledWith(1);
    expect(userId).toBe("user-2");
  });

  it("session 不存在时应返回 null", async () => {
    mockCookieStore({
      "next-auth.session-token": "token-3",
    });
    limitMock.mockResolvedValue([]);

    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
  });
});
