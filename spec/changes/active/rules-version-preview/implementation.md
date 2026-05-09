# Implementation

## Shipped

- 为 Rules 工作台版本快照列表补齐可点击交互和选中态
- 为右侧编辑区增加历史快照只读预览模式
- 增加“返回草稿”和“恢复到草稿”操作，避免历史回看直接覆盖磁盘文件
- 更新 Rules 相关多语言文案并补充 store / component 回归测试

## Verification

- `pnpm lint`
- `pnpm --filter @prompthub/desktop test -- --run tests/unit/components/rules-manager.test.tsx tests/unit/stores/rules.store.test.ts`
- `pnpm --filter @prompthub/desktop build`

## Synced Docs

- `spec/logic/rules-workspace.md`

## Follow-ups

- 可后续补充规则快照 diff 视图
- 可后续补充“从历史快照新建分支草稿”的更细粒度交互
