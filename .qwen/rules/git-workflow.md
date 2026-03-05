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
2.  **Explicit Triggers**:
    - **"commit 代码"**: When the user says this, you should:
      1.  Check status (`git status`).
      2.  Stage all changes (`git add .`).
      3.  Generate a conventional commit message based on the changes.
      4.  Execute the commit.
    - **"push 代码"**: When the user says this, you should:
      1.  Push the current branch to the remote (`git push`).
      2.  Handle upstream setting if necessary (`git push -u origin <branch>`).

## GitHub Integration (MCP)

- **Repository Creation**: When asked to create a repository, use the `create_repository` tool from the `user-github` MCP server.
- **Pull Requests**: Use the `create_pull_request` tool from the `user-github` MCP server when asked to create a PR.
- **Issues**: Use `issue_write` or `list_issues` for issue management.

## Workflow Automation

- When a task involves significant changes, proactively suggest a commit at the end of the response.
- If the user asks to "start a new project", check if a git repo exists. If not, suggest initializing one and creating a remote repo using the GitHub MCP.
