---
description: Test 命令规范
alwaysApply: false
---

# 测试 / Lint / 格式化 规范

## 测试（Test）

- 优先使用项目脚本运行 Vitest，而不是直接调用 Bun 自带测试运行器。
- **命令**：
  - 运行一次性测试：`bun run test`
  - 监听模式：`bun run test:watch`
- **重要提示**：请确保使用 `bun run test` 命令而不是 `bun test` 命令，否则 Bun 将运行自己的测试运行程序。

## Lint

- 使用 Biome 进行代码检查和格式化
- **命令**：
  - 检查代码：`bun biome check .`
  - 格式化代码：`bun biome format --write .`
  - 检查并修复：`bun biome check --apply .`

## 类型检查

- **命令**：`bun run typecheck` 或 `tsc --noEmit`

## 完整验证流程

在完成代码修改后，运行：

```bash
bun check
```

这会依次运行 lint、类型检查和测试。
