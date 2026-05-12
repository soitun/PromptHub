# Implementation

## Shipped

- Desktop 卡片详情 inline edit 状态下的标题输入框和用户提示词编辑框现在使用了明确的白色编辑表面，而不是继续贴合只读态的 `bg-muted/50` 面板底色。
- 这次改动只覆盖 `MainContent.tsx` 的卡片详情 inline edit 场景，没有改变 `Input` / `Textarea` 组件的全局默认样式，因此不会影响其他表单。
- 集成测试新增了编辑态表面样式断言，防止后续把 inline edit 重新退回半透明灰色表面。

## Verification

- `pnpm --filter @prompthub/desktop test -- tests/integration/components/main-content-inline-edit.integration.test.tsx --run`
- `pnpm --filter @prompthub/desktop exec tsc --noEmit`
