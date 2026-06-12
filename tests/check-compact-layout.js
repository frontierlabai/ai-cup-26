const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, "..", "index.html"), "utf8");
const failures = [];

const requiredSnippets = [
  ['<main class="dashboard-shell">', "main should use the compact dashboard shell"],
  ['class="hero dashboard-hero"', "hero should be assigned to the compact dashboard grid"],
  ['class="section dashboard-data"', "data section should be assigned to the compact dashboard grid"],
  ['class="section dashboard-brief"', "brief section should be assigned to the compact dashboard grid"],
  ['class="section dashboard-groups"', "groups section should be assigned to the compact dashboard grid"],
  ['class="section dashboard-news"', "news section should be assigned to the compact dashboard grid"],
  ["@media (min-width: 1100px)", "desktop compact media query is missing"],
  ["height: 100dvh;", "desktop layout should lock to the viewport height"],
  ["overflow: hidden;", "desktop layout should prevent page-level scrolling"],
  ["grid-template-areas:", "desktop layout should use explicit dashboard grid areas"],
  ["grid-template-columns: 0.9fr 2fr 1fr;", "desktop columns should use proportional sizing"],
  ["grid-template-rows: auto 0.86fr 0.44fr 1.7fr;", "desktop rows should use proportional sizing"],
  ["grid-template-columns: repeat(2, minmax(0, 1fr));\n        grid-template-rows: repeat(2, minmax(0, 1fr));", "desktop score list should use a balanced two-by-two layout"],
  ["grid-template-columns: repeat(4, minmax(0, 1fr));\n        grid-template-rows: repeat(3, minmax(0, 1fr));", "desktop groups should use a balanced four-by-three layout"],
  ["grid-template-columns: repeat(2, minmax(0, 1fr));\n        grid-template-rows: repeat(3, minmax(0, 1fr));", "desktop news should use a balanced two-by-three layout"],
  ["grid-template-rows: repeat(2, minmax(0, 1fr));", "desktop brief panels should split available height proportionally"]
];

for (const [snippet, message] of requiredSnippets) {
  if (!html.includes(snippet)) failures.push(message);
}

const visibleSections = (html.match(/<section /g) || []).length;
if (visibleSections !== 6) {
  failures.push(`expected 6 visible sections in the one-screen dashboard, found ${visibleSections}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
