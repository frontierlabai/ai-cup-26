const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const workflowPath = path.join(root, ".github", "workflows", "update-matches.yml");
const dataPath = path.join(root, "data", "matches.json");
const indexPath = path.join(root, "index.html");

assert.ok(fs.existsSync(workflowPath), "update workflow should exist");
assert.ok(fs.existsSync(dataPath), "matches snapshot should exist");

const workflow = fs.readFileSync(workflowPath, "utf8");
assert.match(workflow, /cron:\s+['"]\*\/10 \* \* \* \*['"]/, "workflow should run every 10 minutes");
assert.match(workflow, /workflow_dispatch:/, "workflow should support manual runs");
assert.match(workflow, /contents:\s+write/, "workflow should be able to commit JSON changes");
assert.match(workflow, /node scripts\/update-matches\.mjs/, "workflow should run the match updater");
assert.match(workflow, /git diff --quiet -- data\/matches\.json/, "workflow should commit only when snapshot changes");

const snapshot = JSON.parse(fs.readFileSync(dataPath, "utf8"));
assert.equal(snapshot.schemaVersion, 1, "snapshot schema version should be explicit");
assert.ok(Array.isArray(snapshot.scoreboard) && snapshot.scoreboard.length > 0, "snapshot should include scoreboard matches");
assert.ok(Array.isArray(snapshot.upcoming) && snapshot.upcoming.length > 0, "snapshot should include upcoming matches");
assert.ok(snapshot.generatedAtBeijing.startsWith("北京时间 "), "snapshot should include Beijing generated time");
for (const match of snapshot.matches) {
  assert.ok(fs.existsSync(path.join(root, match.home.flag)), `home flag should exist for ${match.home.code}`);
  assert.ok(fs.existsSync(path.join(root, match.away.flag)), `away flag should exist for ${match.away.code}`);
}

const index = fs.readFileSync(indexPath, "utf8");
assert.ok(index.includes("data/matches.json?ts="), "page should load the generated JSON snapshot");
assert.ok(index.includes("loadMatchSnapshot"), "page should render dynamic match snapshots");
