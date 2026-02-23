---
description: 修复切换元素（如按钮↔输入框）时的 UI 高度抖动，保持布局稳定
alwaysApply: false
---

# 布局高度一致性：消除切换时的 UI 抖动

当同一位置在按钮、输入框等不同状态间切换时，若高度不一致会导致布局抖动。按以下方式处理。

## 核心原则

1. **在共享 class 中统一定义高度**：用显式 `h-X` 替代由 padding 推算出的高度
2. **子元素填满父级**：使用 `h-full min-h-0` 而非硬编码像素
3. **尽量少改结构**：只调整高度相关样式，保持原有 if/else 分支

## 实现步骤

### 1. 为共享操作项添加固定高度

若按钮、链接等共用同一 class，在该 class 中用 `h-8` 等显式高度替代 `py-1.5`：

```tsx
// ❌ 高度由 padding 间接决定，切换时易产生抖动
const actionItemClass =
  "flex items-center gap-2 rounded-md py-1.5 pl-3 pr-1 text-[13px]";

// ✅ 显式高度，所有操作项一致
const actionItemClass =
  "flex items-center gap-2 rounded-md h-8 pl-3 pr-1 text-[13px]";
```

### 2. 输入容器与按钮使用相同高度

切换为输入框时，容器高度需与按钮相同：

```tsx
// ❌ 输入容器高度与按钮不一致
<div className="py-1 pl-3 pr-1">
  <Input ... />
</div>

// ✅ 容器与按钮同高
<div className="flex flex-col h-8 gap-1">
  <form className="w-full h-full">
    <Input className="h-full min-h-0 px-2 text-[13px] leading-none" />
  </form>
</div>
```

### 3. 输入框填满父级

使用 `h-full min-h-0` 让 Input 填满父级，`min-h-0` 避免 flex 子元素默认最小高度导致的溢出：

```tsx
// ❌ 固定像素，可能与父级不匹配
<Input className="h-[26px] px-2" />

// ✅ 自适应父级高度
<Input className="h-full min-h-0 px-2 text-[13px] leading-none" />
```

## 对比总结

| 做法       | 不推荐                 | 推荐                 |
| ---------- | ---------------------- | -------------------- |
| 高度定义   | `py-1.5`（间接）       | `h-8`（显式）        |
| 输入框高度 | `h-5` / `h-[26px]`     | `h-full min-h-0`     |
| 结构调整   | 新增 wrapper、合并容器 | 保持原结构，仅调样式 |
