---
description: Prohibit `as any` type assertions without explicit justification
globs: "**/*.{ts,tsx}"
alwaysApply: true
---

# 禁止 `as any` 类型断言

## 核心规则

**严格禁止使用 `as any` 类型断言**，除非满足以下所有条件：

### 允许使用的例外情况

1. **用户明确请求**：用户明确要求使用 `as any`
2. **无类型安全替代方案**：确实没有任何类型安全的替代方案
3. **必须添加注释说明**：必须在使用处添加清晰的注释，说明为什么必须使用 `as any`

### 正确的使用示例

```typescript
// ❌ 错误：没有说明理由
const data = response as any;

// ✅ 正确：有充分的注释说明
// 第三方库返回类型错误，已提交 issue 等待修复
// https://github.com/example/lib/issues/123
const data = response as any;
```

## 优先替代方案

在使用 `as any` 之前，必须考虑以下类型安全的替代方案：

1. **定义正确的类型**：
```typescript
interface ApiResponse {
  // 定义正确的数据结构
}
const data = response as ApiResponse;
```

2. **使用 Partial 或 Pick**：
```typescript
const data = response as Partial<ApiResponse>;
```

3. **使用类型守卫**：
```typescript
function isApiResponse(data: unknown): data is ApiResponse {
  // 类型守卫逻辑
}
```

4. **使用 unknown + 类型收窄**：
```typescript
const data = response as unknown;
if (isValidResponse(data)) {
  // 安全使用
}
```

## 执行要求

- 发现 `as any` 时，必须首先建议类型安全的替代方案
- 如果用户坚持使用，必须要求添加注释说明理由
- 在代码审查中，所有 `as any` 都需要特别说明
