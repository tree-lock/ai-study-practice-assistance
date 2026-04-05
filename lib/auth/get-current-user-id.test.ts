import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = {
  cookiesMock: vi.fn(),
  selectMock: vi.fn(),
  fromMock: vi.fn(),
  whereMock: vi.fn(),
  limitMock: vi.fn(),
};

mockState.whereMock.mockImplementation(() => ({ limit: mockState.limitMock }));
mockState.fromMock.mockImplementation(() => ({ where: mockState.whereMock }));
mockState.selectMock.mockImplementation(() => ({ from: mockState.fromMock }));

vi.mock("next/headers", () => ({
  cookies: mockState.cookiesMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockState.selectMock(...args),
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
  mockState.cookiesMock.mockResolvedValue({
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
    mockState.cookiesMock.mockReset();
    mockState.selectMock.mockClear();
    mockState.fromMock.mockClear();
    mockState.whereMock.mockClear();
    mockState.limitMock.mockReset();
    mockState.whereMock.mockImplementation(() => ({
      limit: mockState.limitMock,
    }));
    mockState.fromMock.mockImplementation(() => ({
      where: mockState.whereMock,
    }));
    mockState.selectMock.mockImplementation(() => ({
      from: mockState.fromMock,
    }));
  });

  it("没有任何会话 cookie 时应返回 null", async () => {
    mockCookieStore({});

    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
    expect(mockState.selectMock).not.toHaveBeenCalled();
  });

  it("存在 authjs.session-token 且 session 有效时应返回 userId", async () => {
    mockCookieStore({
      "authjs.session-token": "token-1",
    });
    mockState.limitMock.mockResolvedValue([{ userId: "user-1" }]);

    const userId = await getCurrentUserId();

    expect(mockState.selectMock).toHaveBeenCalledWith({
      userId: "user_id_column",
    });
    expect(mockState.limitMock).toHaveBeenCalledWith(1);
    expect(userId).toBe("user-1");
  });

  it("使用 __Secure-next-auth.session-token 兜底时也应正常工作", async () => {
    mockCookieStore({
      "__Secure-next-auth.session-token": "secure-token",
    });
    mockState.limitMock.mockResolvedValue([{ userId: "user-2" }]);

    const userId = await getCurrentUserId();

    expect(mockState.limitMock).toHaveBeenCalledWith(1);
    expect(userId).toBe("user-2");
  });

  it("session 不存在时应返回 null", async () => {
    mockCookieStore({
      "next-auth.session-token": "token-3",
    });
    mockState.limitMock.mockResolvedValue([]);

    const userId = await getCurrentUserId();

    expect(userId).toBeNull();
  });
});
