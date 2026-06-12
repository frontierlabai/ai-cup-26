# FIFA 2026 World Cup Dashboard

一个静态的 2026 世界杯数据看板，整理赛程、分组、新闻入口和球队旗帜资源。

## 在线访问

https://frontierlabai.github.io/ai-cup-26/

## 文件结构

- `index.html`：页面主体、样式和交互
- `assets/flags/`：球队旗帜图片
- `tests/check-flags.js`：检查旗帜引用和 PNG 文件
- `tests/check-compact-layout.js`：检查桌面端紧凑布局结构

## 本地检查

```bash
node tests/check-flags.js
node tests/check-compact-layout.js
```

这是纯静态页面，直接打开 `index.html` 即可预览。
