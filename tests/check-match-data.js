const assert = require("assert");

async function main() {
  const { buildSnapshot, mergeHistoricalMatches, normalizeEspnEvent } = await import("../scripts/update-matches.mjs");
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

  const foxborough = normalizeEspnEvent({
    id: "760430",
    date: "2026-06-16T22:00Z",
    status: { type: { state: "pre", completed: false, description: "Scheduled", shortDetail: "Scheduled" } },
    competitions: [{
      venue: { address: { city: "Foxborough, Massachusetts" } },
      competitors: [
        { homeAway: "home", score: "0", team: { abbreviation: "IRQ", displayName: "Iraq" } },
        { homeAway: "away", score: "0", team: { abbreviation: "NOR", displayName: "Norway" } }
      ]
    }]
  });

  assert.equal(foxborough.venue, "波士顿");

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
  assert.ok(snapshot.recentCompleted.some((match) => match.title === "德国 7-1 库拉索"));
  assert.equal(snapshot.upcoming[0].title, "西班牙 vs 佛得角");
  assert.equal(snapshot.upcoming[0].kickoffBeijing, "06-16 00:00 北京");

  const noLiveSnapshot = buildSnapshot({
    now: new Date("2026-06-16T03:10:00.000Z"),
    sourceUrl,
    previousMatches: [],
    events: [
      {
        id: "final-1",
        date: "2026-06-15T16:00Z",
        status: { type: { state: "post", completed: true, description: "Full Time", shortDetail: "FT" } },
        competitions: [{
          venue: { address: { city: "Atlanta, Georgia" } },
          competitors: [
            { homeAway: "home", score: "0", team: { abbreviation: "ESP", displayName: "Spain" } },
            { homeAway: "away", score: "0", team: { abbreviation: "CPV", displayName: "Cape Verde" } }
          ]
        }]
      },
      {
        id: "final-2",
        date: "2026-06-15T19:00Z",
        status: { type: { state: "post", completed: true, description: "Full Time", shortDetail: "FT" } },
        competitions: [{
          venue: { address: { city: "Seattle, Washington" } },
          competitors: [
            { homeAway: "home", score: "1", team: { abbreviation: "BEL", displayName: "Belgium" } },
            { homeAway: "away", score: "1", team: { abbreviation: "EGY", displayName: "Egypt" } }
          ]
        }]
      },
      {
        id: "final-3",
        date: "2026-06-15T22:00Z",
        status: { type: { state: "post", completed: true, description: "Full Time", shortDetail: "FT" } },
        competitions: [{
          venue: { address: { city: "Miami Gardens, Florida" } },
          competitors: [
            { homeAway: "home", score: "1", team: { abbreviation: "KSA", displayName: "Saudi Arabia" } },
            { homeAway: "away", score: "1", team: { abbreviation: "URU", displayName: "Uruguay" } }
          ]
        }]
      },
      {
        id: "final-4",
        date: "2026-06-16T01:00Z",
        status: { type: { state: "post", completed: true, description: "Full Time", shortDetail: "FT" } },
        competitions: [{
          venue: { address: { city: "Inglewood, California" } },
          competitors: [
            { homeAway: "home", score: "2", team: { abbreviation: "IRN", displayName: "Iran" } },
            { homeAway: "away", score: "2", team: { abbreviation: "NZL", displayName: "New Zealand" } }
          ]
        }]
      },
      {
        id: "upcoming-1",
        date: "2026-06-16T19:00Z",
        status: { type: { state: "pre", completed: false, description: "Scheduled", shortDetail: "Scheduled" } },
        competitions: [{
          venue: { address: { city: "Philadelphia, Pennsylvania" } },
          competitors: [
            { homeAway: "home", score: "0", team: { abbreviation: "FRA", displayName: "France" } },
            { homeAway: "away", score: "0", team: { abbreviation: "SEN", displayName: "Senegal" } }
          ]
        }]
      },
      {
        id: "upcoming-2",
        date: "2026-06-16T22:00Z",
        status: { type: { state: "pre", completed: false, description: "Scheduled", shortDetail: "Scheduled" } },
        competitions: [{
          venue: { address: { city: "Seattle, Washington" } },
          competitors: [
            { homeAway: "home", score: "0", team: { abbreviation: "IRQ", displayName: "Iraq" } },
            { homeAway: "away", score: "0", team: { abbreviation: "NOR", displayName: "Norway" } }
          ]
        }]
      }
    ]
  });

  assert.deepEqual(
    noLiveSnapshot.scoreboard.map((match) => match.statusKind),
    ["final", "final", "upcoming", "upcoming"],
    "scoreboard should show latest completed matches plus upcoming matches when no match is live"
  );
  assert.ok(
    noLiveSnapshot.scoreboard.some((match) => match.title === "法国 vs 塞内加尔"),
    "scoreboard should not hide the next upcoming match behind four completed results"
  );

  const mergedHistory = mergeHistoricalMatches(
    [
      {
        id: "760422",
        date: "2026-06-14T17:00Z",
        statusKind: "final",
        title: "德国 7-1 库拉索"
      },
      {
        id: "old-opener",
        date: "2026-06-11T19:00Z",
        statusKind: "final",
        title: "墨西哥 2-0 南非"
      }
    ],
    [
      {
        id: "760422",
        date: "2026-06-14T17:00Z",
        statusKind: "final",
        title: "德国 8-1 库拉索"
      },
      {
        id: "future",
        date: "2026-06-16T19:00Z",
        statusKind: "upcoming",
        title: "比利时 vs 埃及"
      }
    ]
  );

  assert.deepEqual(
    mergedHistory.map((match) => match.title),
    ["德国 8-1 库拉索", "墨西哥 2-0 南非"],
    "historical final matches should keep old finals and replace same-id finals with fresh data"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
