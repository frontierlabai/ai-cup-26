const assert = require("assert");

async function main() {
  const { buildSnapshot, normalizeEspnEvent } = await import("../scripts/update-matches.mjs");
  const now = new Date("2026-06-15T00:38:00.000Z");
  const sourceUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260614-20260616";

  const germany = normalizeEspnEvent({
    id: "760422",
    date: "2026-06-14T17:00Z",
    links: [{ href: "https://www.espn.com/soccer/match/_/gameId/760422/curacao-germany" }],
    status: { type: { state: "post", completed: true, description: "Full Time", shortDetail: "FT" } },
    competitions: [{
      venue: { fullName: "NRG Stadium", address: { city: "Houston, Texas" } },
      competitors: [
        { homeAway: "home", score: "7", team: { abbreviation: "GER", displayName: "Germany" } },
        { homeAway: "away", score: "1", team: { abbreviation: "CUW", displayName: "Curaçao" } }
      ]
    }]
  });

  assert.equal(germany.title, "德国 7-1 库拉索");
  assert.equal(germany.statusKind, "final");
  assert.equal(germany.group, "E 组");
  assert.equal(germany.kickoffBeijing, "06-15 01:00 北京");
  assert.equal(germany.venue, "休斯顿");

  const snapshot = buildSnapshot({
    now,
    sourceUrl,
    events: [
      {
        id: "760422",
        date: "2026-06-14T17:00Z",
        status: { type: { state: "post", completed: true, description: "Full Time", shortDetail: "FT" } },
        competitions: [{
          venue: { address: { city: "Houston, Texas" } },
          competitors: [
            { homeAway: "home", score: "7", team: { abbreviation: "GER", displayName: "Germany" } },
            { homeAway: "away", score: "1", team: { abbreviation: "CUW", displayName: "Curaçao" } }
          ]
        }]
      },
      {
        id: "760425",
        date: "2026-06-15T02:00Z",
        status: { type: { state: "in", completed: false, description: "First Half", shortDetail: "40'" } },
        competitions: [{
          venue: { address: { city: "Monterrey" } },
          competitors: [
            { homeAway: "home", score: "2", team: { abbreviation: "SWE", displayName: "Sweden" } },
            { homeAway: "away", score: "1", team: { abbreviation: "TUN", displayName: "Tunisia" } }
          ]
        }]
      },
      {
        id: "760426",
        date: "2026-06-15T16:00Z",
        status: { type: { state: "pre", completed: false, description: "Scheduled", shortDetail: "Scheduled" } },
        competitions: [{
          venue: { address: { city: "Atlanta, Georgia" } },
          competitors: [
            { homeAway: "home", score: "0", team: { abbreviation: "ESP", displayName: "Spain" } },
            { homeAway: "away", score: "0", team: { abbreviation: "CPV", displayName: "Cape Verde" } }
          ]
        }]
      }
    ]
  });

  assert.equal(snapshot.generatedAtBeijing, "北京时间 06-15 08:38");
  assert.equal(snapshot.live[0].title, "瑞典 2-1 突尼斯");
  assert.equal(snapshot.scoreboard[0].title, "瑞典 2-1 突尼斯");
  assert.equal(snapshot.scoreboard[1].title, "德国 7-1 库拉索");
  assert.equal(snapshot.upcoming[0].title, "西班牙 vs 佛得角");
  assert.equal(snapshot.upcoming[0].kickoffBeijing, "06-16 00:00 北京");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
