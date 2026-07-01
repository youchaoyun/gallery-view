# @youchaoyun/plugin-gallery-view

[English](./README.md) | 简体中文

</div>

`@youchaoyun/plugin-gallery-view` 是一个 NocoBase 画廊视图区块插件，用于将多条数据记录以图片卡片轮播的方式进行展示，适合产品展示、案例展示、作品集浏览、图文内容导览等场景。

当前版本支持 `Effect cover flow`、`Thumbs`、`Vertical` 三种展示模式，并支持点击条目后打开记录详情弹窗。

## 功能特性

- 支持三种画廊布局模式
  - `Effect cover flow`
  - `Thumbs`
  - `Vertical`
- 支持封面、标题、简介字段映射
- 支持附件字段作为封面图来源
- 支持关联字段封面自动补充查询 `appends`
- 支持外观配置
  - 卡片间距
  - 显示数量
  - 图片适应方式
  - 轮播间隔
- 支持恢复默认外观参数
- 支持容器尺寸较小时自动进入紧凑布局
  - 自动隐藏简介
  - 自动调整可见卡片数量与间距
  - 占位图在小尺寸下自动隐藏文案
- 支持点击条目后通过 `openView` 打开详情弹窗
- 支持无数据源时使用内置假数据预览
- 支持其他插件扩展可用于 `Cover field` 的字段接口

## 适用场景

- 产品画册展示
- 作品集轮播浏览
- 图文案例列表展示
- 轮播式内容导览
- 带封面图的多记录可视化展示

## 区块说明

插件注册了一个区块：

- 区块名称：`Gallery view`
- 中文名称：`画廊视图`

该区块面向多条记录数据进行展示，会按当前数据源查询结果渲染画廊内容。

## 配置说明

画廊视图区块主要包含以下配置分组。

### 1. 字段映射

用于指定画廊展示所需的字段来源。

基础字段：

- `Cover field`
  - 用于显示每条记录的封面图片
  - 默认支持附件字段
  - 当字段为关联字段时，会自动补充资源查询所需的 `appends`
- `Title field`
  - 用于显示画廊标题
- `Description field`
  - 用于显示画廊简介内容

说明：

- 字段映射支持 `ctx.collection.xxx` 形式的变量表达式
- 封面字段值支持数组、对象或字符串形式的图片地址读取
- 当未读取到封面图时，会显示占位图

### 2. 外观

用于控制画廊的视觉样式和轮播行为。

- `Layout mode`
  - 控制画廊布局模式
  - 可选值：
    - `Effect cover flow`
    - `Thumbs`
    - `Vertical`
- `Card gap`
  - 控制卡片之间的间距
- `Display count`
  - 控制默认展示数量
  - 当区块过窄或过矮时，插件会优先保证图片展示效果，不一定严格等于该值
- `Image fit`
  - 控制图片填充方式
  - 可选值：
    - `cover`
    - `contain`
    - `fill`
    - `none`
- `Carousel interval`
  - 控制自动轮播间隔
  - `0` 表示关闭自动轮播
- `Restore default`
  - 一键恢复默认外观参数

默认外观参数：

```ts
{
  layoutMode: 'effectCoverFlow',
  cardGap: 16,
  displayCount: 4,
  imageFit: 'cover',
  carouselInterval: 3000,
}
```

## 布局模式说明

### Effect cover flow

该模式使用封面流效果展示当前画廊内容，适合强调视觉中心图的展示场景。

当前具备以下表现：

- 中间卡片高亮显示
- 支持自动轮播
- 支持点击下方图文信息区域打开详情弹窗
- 当区块高度较小时自动进入紧凑模式
  - 减少可见卡片数
  - 缩小卡片间距
  - 隐藏简介内容

### Thumbs

该模式由主图区域和底部缩略图区域组成，适合需要快速切换浏览图片的场景。

当前具备以下表现：

- 主图支持轮播切换
- 底部缩略图支持联动定位
- 主图覆盖标题与简介信息
- 点击主图卡片可打开详情弹窗

### Vertical

该模式以竖向轮播卡片的形式展示多条记录，适合在较高区域内连续浏览内容。

当前具备以下表现：

- 竖向滚动轮播
- 支持鼠标滚轮切换
- 卡片封面图上叠加标题和简介
- 点击卡片可打开详情弹窗
- 在较小高度下自动切换为紧凑布局

## 条目点击交互

插件注册了条目点击事件：

- 事件名：`itemClick`

默认内置了一个 `popupSettings` 流程，并在点击条目时使用 `openView` 打开详情弹窗。

说明：

- 点击画廊条目时，会根据当前记录主键生成 `filterByTk`
- 弹窗默认关闭路由跳转，避免二次进入时无法重新触发弹窗事件

## 效果预览

### Effect cover flow 示例

![Effect cover flow 示例](docs/image.png)

### Thumbs 示例

![Thumbs 示例](docs/image-1.png)

### Vertical 示例

![Vertical 示例](docs/image-2.png)

### 画廊设置示例

![画廊设置示例](docs/image-3.png)

## 无数据源时的预览

如果区块尚未配置数据源，插件会使用内置假数据进行展示，方便在配置态下预览样式。

默认假数据包含：

- `title`
- `description`
- `cover`

## 扩展能力

插件默认仅将 `attachment` 作为 `Cover field` 可选字段接口。

如果其他插件需要扩展可作为封面字段的接口类型，可通过客户端插件实例调用：

```typescript
// client/plugin.tsx  multipleEntryModesAttachment为想要注册的类型
  const galleryViewPlugin = this.app.pm.get<any>('@youchaoyun/plugin-gallery-view');
  galleryViewPlugin?.registerGalleryCoverFieldInterfaces?.(['multipleEntryModesAttachment']);
```

说明：

- 内部会自动去重
- 已注册接口会参与 `Cover field` 字段选择范围

## 依赖要求

插件声明了以下依赖：

- `swiper`

插件声明了以下 `peerDependencies`：

- `@nocobase/client: 2.x`
- `@nocobase/server: 2.x`
- `@nocobase/test: 2.x`


## 已实现能力总结

当前 README 对应的实现能力包括：

- 画廊视图区块注册
- 封面、标题、简介字段映射
- 三种布局模式切换
- 自动轮播配置
- 图片填充方式配置
- 紧凑布局自适应
- 占位图文案自适应隐藏
- 关联字段封面自动补充查询
- 点击条目弹窗
- 无数据源预览
- 封面字段接口扩展注册

## 注意事项

- `Cover field` 默认支持附件字段，其他字段接口需要额外注册
- 当封面字段映射到关联字段时，插件会自动追加资源查询字段并刷新数据
- `Display count` 在紧凑布局下会根据容器尺寸自动调整，不一定严格按照配置值展示
- 当区块高度或宽度较小时，插件会自动隐藏部分描述信息，以优先保证图片展示效果
- `Carousel interval` 设置为 `0` 时不会自动轮播

## 交流与文档

### Noco 插件交流

欢迎扫码加入 Noco 插件交流，讨论 NocoBase 插件开发、插件使用和企业级扩展实践。

![Noco 插件交流](docs/wxchat.png)

二维码如已过期，可通过下方「更多插件」页面联系获取最新交流群入口。

## 更多插件

有巢数智持续沉淀 NocoBase 企业级插件与扩展能力，更多插件请查看：

[更多 NocoBase 插件扩展](https://docs.youchaoyun.com/cn/infrastructure/nocobase_plugin_extension/)

