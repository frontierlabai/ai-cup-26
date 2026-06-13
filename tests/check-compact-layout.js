const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");
const failures = [];

const requiredSnippets = [
  ['<main class="dashboard-shell">', "main should use the compact dashboard shell"],
  ['class="hero dashboard-hero"', "hero should be assigned to the compact dashboard grid"],
  ['class="section dashboard-brief"', "brief section should be assigned to the compact dashboard grid"],
  ["dashboard-groups", "groups section should be assigned to the compact dashboard grid"],
  ["dashboard-news", "news section should be assigned to the compact dashboard grid"],
  ["dashboard-panel", "major lower dashboard areas should use clear panel framing"],
  ["panel-title-bar", "major lower dashboard areas should use title bars"],
  [".section.dashboard-panel", "panel padding should not be overwritten by generic section rules"],
  ['id="beijingTime"', "top bar should include a Beijing time display"],
  ["timeZone: \"Asia/Shanghai\"", "Beijing time should be formatted with Asia/Shanghai time zone"],
  ["busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js", "page should load the Busuanzi visitor counter script"],
  ['id="busuanzi_container_site_pv"', "top bar should include a site page-view counter container"],
  ['id="busuanzi_value_site_pv"', "top bar should include a site page-view value target"],
  ['id="busuanzi_container_site_uv"', "top bar should include a site visitor counter container"],
  ['id="busuanzi_value_site_uv"', "top bar should include a site visitor value target"],
  ["visit-stats", "top bar should group visitor counter pills"],
  ["@media (min-width: 1100px)", "desktop compact media query is missing"],
  ["height: 100dvh;", "desktop layout should fit within one viewport"],
  ["overflow: hidden;", "desktop layout should prevent page-level scrolling"],
  ["grid-template-areas:", "desktop layout should use explicit dashboard grid areas"],
  ["grid-template-columns: 0.9fr 2fr 1fr;", "desktop columns should use proportional sizing"],
  ['"hero hero hero"', "desktop hero should span all columns as the primary stage"],
  ['"brief groups news"', "desktop lower row should contain the non-primary information"],
  ["grid-template-rows: auto minmax(0, 1.28fr) minmax(0, 1fr);", "desktop rows should prioritize the primary stage and fit the viewport"],
  ["grid-template-rows: auto minmax(0, 1fr);", "page grid should not reserve a footer row"],
  ["@media (max-width: 900px)", "mobile layout media query is missing"],
  [".dashboard-shell {\n        display: block;", "mobile dashboard should return to natural document flow"],
  [".score-card {\n        grid-template-columns: 1fr;", "mobile score cards should stack instead of squeezing three columns"],
  [".nav-links {\n        display: flex;\n        flex-wrap: nowrap;", "phone navigation should stay in one compact horizontal row"],
  [".visit-stats {\n        display: none;", "visitor counter pills should be hidden on phones to keep the fixed nav compact"],
  ["-webkit-overflow-scrolling: touch;", "phone navigation should scroll horizontally without growing tall"],
  ["font-size: clamp(28px, 9vw, 32px);", "mobile title should scale down on narrow screens"],
  ["grid-template-columns: repeat(2, minmax(0, 1fr));\n        grid-template-rows: repeat(2, minmax(0, 1fr));", "desktop score list should use a balanced two-by-two layout"],
  ["grid-template-columns: repeat(4, minmax(0, 1fr));", "desktop groups should use four compact columns"],
  ["grid-template-columns: repeat(2, minmax(0, 1fr));", "desktop news should use two compact columns"],
  ["grid-template-rows: repeat(2, minmax(0, 1fr));", "desktop brief panels should fill the available column evenly"],
  [".panel {\n        min-height: 0;\n        height: 100%;", "brief panels should fill their grid rows"],
  [".timeline {\n        height: calc(100% - 18px);", "timeline contents should fill each panel"],
  ["team-result", "completed group results should be merged into team rows"],
  ["墨西哥 2-0 南非", "A group should record Mexico 2-0 South Africa"],
  ["韩国 2-1 捷克", "A group should record Korea 2-1 Czechia"],
  ["加拿大 1-1 波黑", "B group should record Canada 1-1 Bosnia and Herzegovina"],
  ["美国 4-1 巴拉圭", "D group should record USA 4-1 Paraguay"],
  ["D 组积分", "standings snapshot should show Group D after USA Paraguay"],
  ["赛事周期(天)", "duration metric should put the day unit in the label"],
  ["<strong>39</strong>", "duration metric value should be numeric only"],
  ["比分与赛程", "score panel should mix recent results with upcoming matches"],
  ["待开赛", "score panel should include upcoming matches instead of staying all-final"],
  ["巴西 vs 摩洛哥", "score panel should include the next Brazil Morocco fixture"],
  ["hero-insights", "hero should use the open space for schedule and standings insight panels"],
  ["今日赛程", "hero insight panel should include upcoming fixtures"],
  ["积分速览", "hero insight panel should include group standings"],
  ["卡塔尔 vs 瑞士", "upcoming fixtures should show Qatar vs Switzerland"],
  ["A 组积分", "standings snapshot should show Group A table"],
  ["B 组积分", "standings snapshot should show Group B table"],
  ["overflow-y: auto;", "squeezed desktop hero panels should scroll vertically instead of clipping content"],
  ["scrollbar-gutter: stable;", "scrollable hero panels should reserve stable scrollbar space"],
  ["历史比分", "primary hero feed should show compact history context"],
  ["scoreDrawer", "page should include a score history drawer"],
  ["openScoreDrawerSide", "score history drawer should be openable from the side panel"],
  ["history-compact", "top score area should include a compact history panel"],
  ["grid-template-columns: minmax(0, 1fr) minmax(180px, 0.34fr);", "top score area should place history beside live scores in a narrower column"],
  ["暂无完赛比分", "score history should support an empty state"],
  ['<span class="hero-title-part">2026 世界杯</span><span class="hero-title-part">赛事看板</span>', "hero title should split cleanly on narrow screens"]
];

for (const [snippet, message] of requiredSnippets) {
  if (!html.includes(snippet)) failures.push(message);
}

const visibleSections = (html.match(/<section /g) || []).length;
if (visibleSections !== 5) {
  failures.push(`expected 5 visible sections after removing duplicate data, found ${visibleSections}`);
}

if (html.includes('class="section dashboard-data"')) {
  failures.push("duplicate dashboard data section should be removed");
}

if (html.includes("group-results")) {
  failures.push("group results should not be placed in a separate bottom block");
}

if (!html.includes('class="section dashboard-groups dashboard-panel"')) {
  failures.push("groups area should be framed as a dashboard panel");
}

if (!html.includes('class="section dashboard-news dashboard-panel"')) {
  failures.push("news area should be framed as a dashboard panel");
}

if (html.includes("<footer>")) {
  failures.push("footer disclaimer should be removed");
}

const refreshIndex = html.indexOf('class="hero-insights"');
const heroSideIndex = html.indexOf('class="hero-side"');
if (refreshIndex === -1 || heroSideIndex === -1 || refreshIndex > heroSideIndex) {
  failures.push("hero insight panels should be placed in the primary hero summary area, before the score side");
}

if (html.includes("hero-feed")) {
  failures.push("old hero history feed should be removed now that history has its own side panel");
}

const removedReloadSnippets = [
  ["window.location.reload()", "snapshot note should not trigger automatic page reloads"],
  ["manualRefresh", "manual refresh button should be removed from the compact snapshot note"],
  ["refreshProgress", "refresh progress bar should be removed from the compact snapshot note"],
  ["REFRESH_INTERVAL_MS", "refresh interval logic should be removed when reload UI is removed"],
  ['class="refresh-card"', "large refresh card should be removed from the hero"],
  ["snapshot-note", "snapshot note should be removed from the hero"],
  ["快照时间：2026-06-13 亚洲/上海", "snapshot time pill should be removed from the hero"],
  ["首屏集中显示比分、赛程入口和核心赛事数据 可变赛果以 FIFA 官方链接为准", "hero explanatory copy should be removed"],
  ["赛果以 FIFA 官方链接为准，刷新页面只会读取已发布内容。", "snapshot explanatory copy should be removed"],
  ["打开实时赛程", "hero CTA buttons should be removed"],
  ["打开实时积分榜", "hero standings CTA should be removed"],
  ["看新闻入口", "hero news CTA should be removed"],
  ["hero-actions", "hero CTA container should be removed"]
];

for (const [snippet, message] of removedReloadSnippets) {
  if (html.includes(snippet)) failures.push(message);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
