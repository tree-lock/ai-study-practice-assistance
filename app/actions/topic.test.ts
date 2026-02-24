import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  limitMock,
  fromMock,
  whereSelectMock,
  selectMock,
  valuesMock,
  insertMock,
  whereUpdateMock,
  setMock,
  updateMock,
  whereDeleteMock,
  deleteMock,
  getCurrentUserIdMock,
  revalidatePathMock,
} = vi.hoisted(() => {
  const localLimitMock = vi.fn().mockResolvedValue([]);
  const localWhereSelectMock = vi.fn(() => ({
    // biome-ignore lint/suspicious/noThenProperty: mock thenable for Drizzle chain
    then: (
      onFulfilled: (v: unknown) => void,
      onRejected?: (e: unknown) => void,
    ) => localLimitMock().then(onFulfilled, onRejected),
    limit: localLimitMock,
  }));
  const localFromMock = vi.fn(() => ({ where: localWhereSelectMock }));
  const localSelectMock = vi.fn(() => ({ from: localFromMock }));

  const localValuesMock = vi.fn().mockResolvedValue(undefined);
  const localInsertMock = vi.fn(() => ({ values: localValuesMock }));

  const localWhereUpdateMock = vi.fn().mockResolvedValue(undefined);
  const localSetMock = vi.fn(() => ({ where: localWhereUpdateMock }));
  const localUpdateMock = vi.fn(() => ({ set: localSetMock }));

  const localWhereDeleteMock = vi.fn().mockResolvedValue(undefined);
  const localDeleteMock = vi.fn(() => ({ where: localWhereDeleteMock }));

  const localGetCurrentUserIdMock = vi.fn().mockResolvedValue("user-1");
  const localRevalidatePathMock = vi.fn();

  return {
    limitMock: localLimitMock,
    fromMock: localFromMock,
    whereSelectMock: localWhereSelectMock,
    selectMock: localSelectMock,
    valuesMock: localValuesMock,
    insertMock: localInsertMock,
    whereUpdateMock: localWhereUpdateMock,
    setMock: localSetMock,
    updateMock: localUpdateMock,
    whereDeleteMock: localWhereDeleteMock,
    deleteMock: localDeleteMock,
    getCurrentUserIdMock: localGetCurrentUserIdMock,
    revalidatePathMock: localRevalidatePathMock,
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/auth/get-current-user-id", () => ({
  getCurrentUserId: getCurrentUserIdMock,
}));

vi.mock("@/lib/ai/topic/outline", () => ({
  generateOutline: vi.fn(async () => "第一章 概述\n第二章 基础概念"),
  generateKnowledgePointsFromOutline: vi.fn(async () => []),
}));

const mocks = {
  limitMock,
  fromMock,
  whereSelectMock,
  selectMock,
  valuesMock,
  insertMock,
  whereUpdateMock,
  setMock,
  updateMock,
  whereDeleteMock,
  deleteMock,
  getCurrentUserIdMock,
  revalidatePathMock,
};

import {
  createTopic,
  deleteTopic,
  getTopics,
  updateTopic,
} from "@/app/actions/topic";

describe("topic actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.limitMock.mockResolvedValue([]);
    mocks.getCurrentUserIdMock.mockResolvedValue("user-1");
    mocks.valuesMock.mockResolvedValue(undefined);
    mocks.whereUpdateMock.mockResolvedValue(undefined);
    mocks.whereDeleteMock.mockResolvedValue(undefined);
  });

  it("getTopics 应返回查询结果", async () => {
    const rows = [{ id: "1", name: "高等数学", description: "极限与微分" }];
    mocks.limitMock.mockResolvedValue(rows);

    const result = await getTopics();

    expect(mocks.selectMock).toHaveBeenCalledOnce();
    expect(mocks.fromMock).toHaveBeenCalledOnce();
    expect(mocks.whereSelectMock).toHaveBeenCalledOnce();
    expect(result).toEqual(rows);
  });

  it("getTopics 未登录时应返回空数组", async () => {
    mocks.getCurrentUserIdMock.mockResolvedValueOnce(null);

    const result = await getTopics();

    expect(result).toEqual([]);
    expect(mocks.selectMock).not.toHaveBeenCalled();
  });

  it("createTopic 校验失败时应返回 error", async () => {
    const result = await createTopic({
      name: "",
      description: "无效题库",
    });

    expect(result).toHaveProperty("error");
    expect(mocks.insertMock).not.toHaveBeenCalled();
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
  });

  it("createTopic 成功时应写入并触发 revalidate", async () => {
    const result = await createTopic({
      name: "线性代数",
      description: "矩阵与向量空间",
    });

    expect(mocks.insertMock).toHaveBeenCalledOnce();
    expect(mocks.valuesMock).toHaveBeenCalledWith({
      name: "线性代数",
      description: "矩阵与向量空间",
      userId: "user-1",
    });
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/topics");
    expect(result).toEqual({ success: true });
  });

  it("createTopic 未登录时应返回错误", async () => {
    mocks.getCurrentUserIdMock.mockResolvedValueOnce(null);

    const result = await createTopic({
      name: "线代",
      description: "矩阵",
    });

    expect(result).toEqual({ error: "请先登录后再创建题库" });
    expect(mocks.insertMock).not.toHaveBeenCalled();
  });

  it("createTopic 数据库异常时应返回错误信息", async () => {
    mocks.valuesMock.mockRejectedValue(new Error("insert failed"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await createTopic({
      name: "概率论",
      description: "随机变量与分布",
    });

    expect(result).toEqual({ error: "创建题库失败" });
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("updateTopic 校验失败时应返回 error", async () => {
    const result = await updateTopic("topic-1", {
      name: "",
      description: "无效更新",
    });

    expect(result).toHaveProperty("error");
    expect(mocks.updateMock).not.toHaveBeenCalled();
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
  });

  it("updateTopic 未登录时应返回错误", async () => {
    mocks.getCurrentUserIdMock.mockResolvedValueOnce(null);

    const result = await updateTopic("topic-1", {
      name: "线代",
      description: "矩阵",
    });

    expect(result).toEqual({ error: "请先登录后再更新题库" });
    expect(mocks.updateMock).not.toHaveBeenCalled();
  });

  it("updateTopic 成功时应更新并触发 revalidate", async () => {
    const result = await updateTopic("topic-1", {
      name: "计算机网络",
      description: "TCP/IP 与应用层协议",
    });

    expect(mocks.updateMock).toHaveBeenCalledOnce();
    expect(mocks.setMock).toHaveBeenCalledOnce();
    expect(mocks.whereUpdateMock).toHaveBeenCalledOnce();
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/");
    expect(result).toEqual({ success: true });
  });

  it("updateTopic 数据库异常时应返回错误信息", async () => {
    mocks.whereUpdateMock.mockRejectedValue(new Error("update failed"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await updateTopic("topic-1", {
      name: "数据结构",
      description: "线性表与树图",
    });

    expect(result).toEqual({ error: "更新题库失败" });
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("deleteTopic 成功时应删除并触发 revalidate", async () => {
    const result = await deleteTopic("topic-1");

    expect(mocks.deleteMock).toHaveBeenCalledOnce();
    expect(mocks.whereDeleteMock).toHaveBeenCalledOnce();
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith("/");
    expect(result).toEqual({ success: true });
  });

  it("deleteTopic 未登录时应返回错误", async () => {
    mocks.getCurrentUserIdMock.mockResolvedValueOnce(null);

    const result = await deleteTopic("topic-1");

    expect(result).toEqual({ error: "请先登录后再删除题库" });
    expect(mocks.deleteMock).not.toHaveBeenCalled();
  });

  it("deleteTopic 数据库异常时应返回错误信息", async () => {
    mocks.whereDeleteMock.mockRejectedValue(new Error("delete failed"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deleteTopic("topic-1");

    expect(result).toEqual({ error: "删除题库失败" });
    expect(mocks.revalidatePathMock).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
