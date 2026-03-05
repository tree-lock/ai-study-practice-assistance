---
alwaysApply: false
---

# Git Workflow & Version Control Standards

## Commit Message Convention

All commit messages must follow the Conventional Commits format:
`<type>(<scope>): <subject>`

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Rules

- **Scope** is optional but recommended for clarity (e.g., `feat(auth): add login`).
- **Subject** must be concise and use imperative mood.

## Git Operations Protocol

1.  **No Unauthorized Execution**: You may suggest git commands when relevant to the task, but **NEVER** execute `git` commands (especially destructive ones) without explicit user permission or a clear instruction to do so.
2.  **Pre-commit / Pre-push: Build Check**:
    - 在 **commit** 和 **push** 之前，**必须先执行一次 build**（本项目使用 `bun run build`）。
    - 若 build **失败**，则**不得**继续执行 commit 或 push，并应向用户报告 build 错误。
    - 只有 build **成功**后，才可进行 commit 或 push。
3.  **Explicit Triggers**:
    - **「commit 并 push」/「提交并推送」**：使用 project skill **commit-and-push**，先 build，再 commit，再 push（一步完成）。
    - **"commit 代码"**: When the user says this, you should:
      1.  **Run build** (`bun run build`). If it fails, **stop** and report the error; do not commit.
      2.  Check status (`git status`).
      3.  Stage all changes (`git add .`).
      4.  Generate a conventional commit message based on the changes.
      5.  Execute the commit.
    - **"push 代码"**: When the user says this, you should:
      1.  **Run build** (`bun run build`). If it fails, **stop** and report the error; do not push.
      2.  Push the current branch to the remote (`git push`).
      3.  Handle upstream setting if necessary (`git push -u origin <branch>`).

## GitHub Integration (MCP)

- **Repository Creation**: When asked to create a repository, use the `create_repository` tool from the `user-github` MCP server.
- **Pull Requests**: Use the `create_pull_request` tool from the `user-github` MCP server when asked to create a PR.
- **Issues**: Use `issue_write` or `list_issues` for issue management.

## Workflow Automation

- When a task involves significant changes, proactively suggest a commit at the end of the response.
- If the user asks to "start a new project", check if a git repo exists. If not, suggest initializing one and creating a remote repo using the GitHub MCP.
