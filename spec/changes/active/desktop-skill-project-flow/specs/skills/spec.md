# Skills Delta Spec

## Modified Requirements

### Requirement: Project skill registration should minimize manual steps

桌面端用户在添加 `项目 Skills` 工作区时，应优先通过选择项目目录完成主要输入，并在保存后立即得到扫描结果。

#### Scenario: choose root path first

- Given 用户打开“添加项目”弹窗
- When 用户先选择项目根目录
- Then 界面自动填充一个默认项目名称

#### Scenario: add project auto scans

- Given 用户提供了有效的项目名称与根目录
- When 用户确认添加项目
- Then PromptHub 自动选中新项目并立即执行扫描

### Requirement: Project views should provide a stable visual anchor

`项目 Skills` 页面中的项目条目和项目头部应展示明确的项目标识，且头部边界需要在多栏布局中对齐。

#### Scenario: missing project icon

- Given 项目没有自定义图标
- When 用户查看项目列表或项目详情头部
- Then 界面展示项目名称首字母作为标识
