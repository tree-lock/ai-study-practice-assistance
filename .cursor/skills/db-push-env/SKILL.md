# DB Push 环境变量规范

## 目的

规范 `db:push` 命令的环境变量使用，确保本地开发环境和生产环境数据库操作的隔离性。

## 环境变量文件说明

- **`.env.local`**: 本地开发环境配置，包含本地数据库连接信息
- **`.env.production.local`**: 生产环境配置，包含生产数据库连接信息

## 使用规则

### 1. 本地数据库 Push

当需要将数据库 schema 推送到**本地开发数据库**时，**必须**显式指定环境变量文件：

```bash
bun --env-file=.env.local db:push
```

> **注意**: 不能直接使用 `bun db:push`，因为 Bun 的环境变量不会自动传递给 drizzle-kit 子进程。

### 2. 生产数据库 Push

当需要将数据库 schema 推送到**生产数据库**时，**必须**显式指定环境变量文件：

```bash
bun --env-file=.env.production.local db:push
```

### 3. 安全注意事项

- **操作前确认**: 在执行 `db:push` 前，必须确认当前使用的数据库环境
- **生产环境谨慎操作**: 生产环境的 `db:push` 操作应该经过审查和测试
- **备份**: 重要数据变更前，确保数据库有备份
- **Drizzle 配置**: 确保 `drizzle.config.ts` 正确配置了不同环境的数据库连接

## 触发场景

此 skill 应在以下场景被使用：

- 用户需要运行 `db:push` 命令
- 用户询问数据库迁移或 schema 推送
- 用户需要区分本地和生产环境的数据库操作
- 代码审查中发现 `db:push` 命令缺少环境变量指定

## 示例对话

**用户**: "帮我 push 数据库到本地"
**助手**: 执行 `bun --env-file=.env.local db:push`

**用户**: "需要更新生产数据库"
**助手**: 执行 `bun --env-file=.env.production.local db:push`

## 注意事项

1. **永远不要**在不指定环境变量的情况下运行 `db:push`（无论本地还是生产环境）
2. **环境文件默认存在**: `.env.local` 和 `.env.production.local` 文件默认存在于项目根题库（它们是隐藏文件）
3. **仅在报错时提醒**: 只有当运行命令时明确提示找不到环境文件时，才提醒用户检查文件是否存在或路径是否正确
4. 对于重要的生产数据库变更，建议先使用 `bun --env-file=.env.production.local db:generate` 生成迁移文件进行审查
5. 其他 drizzle-kit 命令（如 `db:generate`、`db:migrate`）也需要显式指定环境文件
