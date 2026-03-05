---
name: commit-and-push
description: 在用户要求「提交并推送」「commit 并 push」「commit 和 push」等时，先执行 build，再按 Conventional Commits 生成信息完成 commit，最后 push 到远端。Build 失败则中止，不执行 git 操作。
---

# Commit 并 Push

## 触发场景

用户明确要求**同时进行 commit 和 push**，例如：

- 「提交并推送」「commit 并 push」「commit 和 push」
- 「提交代码并推送到远程」「commit 然后 push」

仅说「commit 代码」或「push 代码」时，按项目 `.qwen/rules/git-workflow.md` 分别执行，不适用本 skill。

## 执行流程

按顺序执行，任一步失败则**中止**并报告用户，不继续后续步骤。

1. **Build**
   - 执行：`bun run build`
   - 失败 → 报告 build 错误，**不**执行 2–5。

2. **状态与暂存**
   - `git status`
   - `git add .`

3. **生成 Commit 信息**
   - 根据变更内容生成 **Conventional Commits** 格式：`<type>(<scope>): <subject>`
   - Types：`feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore`
   - Scope 可选；subject 简洁、祈使语气。

4. **Commit**
   - 执行：`git commit -m "<生成的 message>"`

5. **Push**
   - 执行：`git push`
   - 若无上游分支：`git push -u origin <当前分支名>`

## 前置条件

- 仅在用户**明确允许**执行 git 操作时运行（如说了「提交并推送」等）。
- 不代替用户做未请求的 commit/push。

## 与项目规则的关系

- Commit 格式、build 前置要求等以 `.qwen/rules/git-workflow.md` 为准；本 skill 实现「先 build → 再 commit → 再 push」的合并流程。
