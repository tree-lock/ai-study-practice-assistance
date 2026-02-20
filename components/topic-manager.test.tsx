import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createTopicMock = vi.fn();
const deleteTopicMock = vi.fn();

vi.mock("@/app/actions/topic", () => ({
  createTopic: (...args: Array<unknown>) => createTopicMock(...args),
  deleteTopic: (...args: Array<unknown>) => deleteTopicMock(...args),
}));

import { TopicForm, TopicList } from "@/components/topic-manager";

describe("TopicManager", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    createTopicMock.mockReset();
    deleteTopicMock.mockReset();
  });

  it("应当渲染一级目录表单且不显示上级目录字段", () => {
    render(<TopicForm />);

    expect(screen.getByLabelText("名称")).toBeInTheDocument();
    expect(screen.getByLabelText("描述")).toBeInTheDocument();
    expect(screen.queryByLabelText("上级目录（可选）")).not.toBeInTheDocument();
  });

  it("提交表单时应调用 createTopic", async () => {
    createTopicMock.mockResolvedValue({ success: true });
    render(<TopicForm />);

    fireEvent.change(screen.getByLabelText("名称"), {
      target: { value: "高等数学" },
    });
    fireEvent.change(screen.getByLabelText("描述"), {
      target: { value: "微积分与极限" },
    });
    fireEvent.click(screen.getByRole("button", { name: "创建目录" }));

    await waitFor(() => {
      expect(createTopicMock).toHaveBeenCalledWith({
        name: "高等数学",
        description: "微积分与极限",
      });
    });
  });

  it("创建目录失败时应展示错误提示", async () => {
    createTopicMock.mockResolvedValue({ error: "请先登录后再创建目录" });
    render(<TopicForm />);

    fireEvent.change(screen.getByLabelText("名称"), {
      target: { value: "高等数学" },
    });
    fireEvent.click(screen.getByRole("button", { name: "创建目录" }));

    await waitFor(() => {
      expect(screen.getByText("请先登录后再创建目录")).toBeInTheDocument();
    });
  });

  it("点击删除并确认后应调用 deleteTopic", async () => {
    deleteTopicMock.mockResolvedValue({ success: true });
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );

    render(
      <TopicList
        topics={[{ id: "1", name: "线性代数", description: "矩阵和向量空间" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "删除" }));

    await waitFor(() => {
      expect(deleteTopicMock).toHaveBeenCalledWith("1");
    });
  });
});
