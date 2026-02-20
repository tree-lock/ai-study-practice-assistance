import { beforeEach, describe, expect, it, vi } from "vitest";

const {
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
  const localWhereSelectMock = vi.fn();
  const localFromMock = vi.fn(() => ({ where: localWhereSelectMock }));
  const localSelectMock = vi.fn(() => ({ from: localFromMock }));

  const localValuesMock = vi.fn();
  const localInsertMock = vi.fn(() => ({ values: localValuesMock }));

  const localWhereUpdateMock = vi.fn();
  const localSetMock = vi.fn(() => ({ where: localWhereUpdateMock }));
  const localUpdateMock = vi.fn(() => ({ set: localSetMock }));

  const localWhereDeleteMock = vi.fn();
  const localDeleteMock = vi.fn(() => ({ where: localWhereDeleteMock }));

  const localGetCurrentUserIdMock = vi.fn();
  const localRevalidatePathMock = vi.fn();

  return {
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

import {
  createTopic,
  deleteTopic,
  getTopics,
  updateTopic,
} from "@/app/actions/topic";

describe("topic actions", () => {
  beforeEach(() => {
    fromMock.mockClear();
    whereSelectMock.mockReset();
    selectMock.mockClear();
    valuesMock.mockReset();
    insertMock.mockClear();
    whereUpdateMock.mockReset();
    setMock.mockClear();
    updateMock.mockClear();
    whereDeleteMock.mockReset();
    deleteMock.mockClear();
    getCurrentUserIdMock.mockReset();
    revalidatePathMock.mockReset();

    getCurrentUserIdMock.mockResolvedValue("user-1");
  });

  it("getTopics 应返回查询结果", async () => {
    const rows = [{ id: "1", name: "高等数学", description: "极限与微分" }];
    whereSelectMock.mockResolvedValue(rows);

    const result = await getTopics();

    expect(selectMock).toHaveBeenCalledOnce();
    expect(fromMock).toHaveBeenCalledOnce();
    expect(whereSelectMock).toHaveBeenCalledOnce();
    expect(result).toEqual(rows);
  });

  it("getTopics 未登录时应返回空数组", async () => {
    getCurrentUserIdMock.mockResolvedValueOnce(null);

    const result = await getTopics();

    expect(result).toEqual([]);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("createTopic 校验失败时应返回 error", async () => {
    const result = await createTopic({
      name: "",
      description: "无效目录",
    });

    expect(result).toHaveProperty("error");
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("createTopic 成功时应写入并触发 revalidate", async () => {
    valuesMock.mockResolvedValue(undefined);

    const result = await createTopic({
      name: "线性代数",
      description: "矩阵与向量空间",
    });

    expect(insertMock).toHaveBeenCalledOnce();
    expect(valuesMock).toHaveBeenCalledWith({
      name: "线性代数",
      description: "矩阵与向量空间",
      userId: "user-1",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/topics");
    expect(result).toEqual({ success: true });
  });

  it("createTopic 未登录时应返回错误", async () => {
    getCurrentUserIdMock.mockResolvedValueOnce(null);

    const result = await createTopic({
      name: "线代",
      description: "矩阵",
    });

    expect(result).toEqual({ error: "请先登录后再创建目录" });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("createTopic 数据库异常时应返回错误信息", async () => {
    valuesMock.mockRejectedValue(new Error("insert failed"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await createTopic({
      name: "概率论",
      description: "随机变量与分布",
    });

    expect(result).toEqual({ error: "创建目录失败" });
    expect(revalidatePathMock).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("updateTopic 校验失败时应返回 error", async () => {
    const result = await updateTopic("topic-1", {
      name: "",
      description: "无效更新",
    });

    expect(result).toHaveProperty("error");
    expect(updateMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("updateTopic 未登录时应返回错误", async () => {
    getCurrentUserIdMock.mockResolvedValueOnce(null);

    const result = await updateTopic("topic-1", {
      name: "线代",
      description: "矩阵",
    });

    expect(result).toEqual({ error: "请先登录后再更新目录" });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updateTopic 成功时应更新并触发 revalidate", async () => {
    whereUpdateMock.mockResolvedValue(undefined);

    const result = await updateTopic("topic-1", {
      name: "计算机网络",
      description: "TCP/IP 与应用层协议",
    });

    expect(updateMock).toHaveBeenCalledOnce();
    expect(setMock).toHaveBeenCalledOnce();
    expect(whereUpdateMock).toHaveBeenCalledOnce();
    expect(revalidatePathMock).toHaveBeenCalledWith("/topics");
    expect(result).toEqual({ success: true });
  });

  it("updateTopic 数据库异常时应返回错误信息", async () => {
    whereUpdateMock.mockRejectedValue(new Error("update failed"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await updateTopic("topic-1", {
      name: "数据结构",
      description: "线性表与树图",
    });

    expect(result).toEqual({ error: "更新目录失败" });
    expect(revalidatePathMock).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("deleteTopic 成功时应删除并触发 revalidate", async () => {
    whereDeleteMock.mockResolvedValue(undefined);

    const result = await deleteTopic("topic-1");

    expect(deleteMock).toHaveBeenCalledOnce();
    expect(whereDeleteMock).toHaveBeenCalledOnce();
    expect(revalidatePathMock).toHaveBeenCalledWith("/topics");
    expect(result).toEqual({ success: true });
  });

  it("deleteTopic 未登录时应返回错误", async () => {
    getCurrentUserIdMock.mockResolvedValueOnce(null);

    const result = await deleteTopic("topic-1");

    expect(result).toEqual({ error: "请先登录后再删除目录" });
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deleteTopic 数据库异常时应返回错误信息", async () => {
    whereDeleteMock.mockRejectedValue(new Error("delete failed"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await deleteTopic("topic-1");

    expect(result).toEqual({ error: "删除目录失败" });
    expect(revalidatePathMock).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
