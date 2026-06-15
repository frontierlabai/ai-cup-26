import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const OUTPUT_PATH = "data/matches.json";

const TEAM_NAMES = {
  ALG: "阿尔及利亚",
  ARG: "阿根廷",
  AUS: "澳大利亚",
  AUT: "奥地利",
  BEL: "比利时",
  BIH: "波黑",
  BRA: "巴西",
  CAN: "加拿大",
  CIV: "科特迪瓦",
  COD: "民主刚果",
  COL: "哥伦比亚",
  CPV: "佛得角",
  CRO: "克罗地亚",
  CUW: "库拉索",
  CZE: "捷克",
  ECU: "厄瓜多尔",
  EGY: "埃及",
  ENG: "英格兰",
  ESP: "西班牙",
  FRA: "法国",
  GER: "德国",
  GHA: "加纳",
  HAI: "海地",
  IRN: "伊朗",
  IRQ: "伊拉克",
  JOR: "约旦",
  JPN: "日本",
  KOR: "韩国",
  KSA: "沙特阿拉伯",
  MAR: "摩洛哥",
  MEX: "墨西哥",
  NED: "荷兰",
  NOR: "挪威",
  NZL: "新西兰",
  PAN: "巴拿马",
  PAR: "巴拉圭",
  POR: "葡萄牙",
  QAT: "卡塔尔",
  RSA: "南非",
  SCO: "苏格兰",
  SEN: "塞内加尔",
  SUI: "瑞士",
  SWE: "瑞典",
  TUN: "突尼斯",
  TUR: "土耳其",
  URU: "乌拉圭",
  USA: "美国",
  UZB: "乌兹别克斯坦"
};

const GROUP_BY_TEAM = {
  MEX: "A", RSA: "A", KOR: "A", CZE: "A",
  CAN: "B", QAT: "B", SUI: "B", BIH: "B",
  BRA: "C", MAR: "C", HAI: "C", SCO: "C",
  USA: "D", PAR: "D", AUS: "D", TUR: "D",
  GER: "E", CUW: "E", CIV: "E", ECU: "E",
  NED: "F", JPN: "F", SWE: "F", TUN: "F",
  BEL: "G", EGY: "G", IRN: "G", NZL: "G",
  ESP: "H", CPV: "H", KSA: "H", URU: "H",
  FRA: "I", SEN: "I", NOR: "I", IRQ: "I",
  ARG: "J", ALG: "J", AUT: "J", JOR: "J",
  POR: "K", UZB: "K", COL: "K", GHA: "K",
  ENG: "L", CRO: "L", PAN: "L", COD: "L"
};

const CITY_NAMES = {
  "Atlanta, Georgia": "亚特兰大",
  "Arlington, Texas": "达拉斯",
  "Boston, Massachusetts": "波士顿",
  "East Rutherford, New Jersey": "纽约新泽西",
  "Guadalajara": "瓜达拉哈拉",
  "Houston, Texas": "休斯顿",
  "Inglewood, California": "洛杉矶",
  "Kansas City, Missouri": "堪萨斯城",
  "Mexico City": "墨西哥城",
  "Miami Gardens, Florida": "迈阿密",
  "Monterrey": "蒙特雷",
  "Philadelphia, Pennsylvania": "费城",
  "Santa Clara, California": "圣克拉拉",
  "Seattle, Washington": "西雅图",
  "Toronto": "多伦多",
  "Vancouver": "温哥华"
};

const BEIJING_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

function formatEspnDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function dateRangeFor(now) {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 1);
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + 2);
  return `${formatEspnDate(start)}-${formatEspnDate(end)}`;
}

function formatBeijing(date) {
  return BEIJING_FORMATTER.format(date).replace(/\//g, "-");
}

function teamName(code, fallback) {
  return TEAM_NAMES[code] || fallback || code;
}

function createFinalMatch({ id, date, group, venue, homeCode, awayCode, homeScore, awayScore, href }) {
  const homeName = teamName(homeCode);
  const awayName = teamName(awayCode);
  const scoreline = `${homeScore}-${awayScore}`;
  return {
    id,
    date,
    kickoffBeijing: `${formatBeijing(new Date(date))} 北京`,
    group,
    venue,
    statusKind: "final",
    statusLabel: "完赛",
    scoreline,
    title: `${homeName} ${scoreline} ${awayName}`,
    href: href || "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures",
    home: {
      code: homeCode,
      name: homeName,
      score: homeScore,
      flag: `assets/flags/${homeCode}.png`
    },
    away: {
      code: awayCode,
      name: awayName,
      score: awayScore,
      flag: `assets/flags/${awayCode}.png`
    }
  };
}

const BASELINE_FINALS = [
  createFinalMatch({
    id: "400021439",
    date: "2026-06-11T19:00Z",
    group: "A 组",
    venue: "墨西哥城",
    homeCode: "MEX",
    awayCode: "RSA",
    homeScore: "2",
    awayScore: "0",
    href: "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021439"
  }),
  createFinalMatch({
    id: "400021441",
    date: "2026-06-12T02:00Z",
    group: "A 组",
    venue: "瓜达拉哈拉",
    homeCode: "KOR",
    awayCode: "CZE",
    homeScore: "2",
    awayScore: "1",
    href: "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021441"
  }),
  createFinalMatch({
    id: "400021449",
    date: "2026-06-12T19:00Z",
    group: "B 组",
    venue: "多伦多",
    homeCode: "CAN",
    awayCode: "BIH",
    homeScore: "1",
    awayScore: "1",
    href: "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021449"
  }),
  createFinalMatch({
    id: "baseline-usa-par",
    date: "2026-06-13T01:00Z",
    group: "D 组",
    venue: "洛杉矶",
    homeCode: "USA",
    awayCode: "PAR",
    homeScore: "4",
    awayScore: "1"
  }),
  createFinalMatch({
    id: "baseline-qat-sui",
    date: "2026-06-13T19:00Z",
    group: "B 组",
    venue: "圣克拉拉",
    homeCode: "QAT",
    awayCode: "SUI",
    homeScore: "1",
    awayScore: "1"
  }),
  createFinalMatch({
    id: "baseline-bra-mar",
    date: "2026-06-13T22:00Z",
    group: "C 组",
    venue: "纽约新泽西",
    homeCode: "BRA",
    awayCode: "MAR",
    homeScore: "1",
    awayScore: "1"
  }),
  createFinalMatch({
    id: "baseline-hai-sco",
    date: "2026-06-14T01:00Z",
    group: "C 组",
    venue: "波士顿",
    homeCode: "HAI",
    awayCode: "SCO",
    homeScore: "0",
    awayScore: "1"
  })
];

function cityName(venue = {}) {
  const raw = venue.address?.city || venue.fullName || "";
  return CITY_NAMES[raw] || raw.replace(/, USA$/, "") || "待定";
}

function getCompetitor(event, homeAway) {
  const competitors = event.competitions?.[0]?.competitors || [];
  return competitors.find((competitor) => competitor.homeAway === homeAway) || competitors[homeAway === "home" ? 0 : 1];
}

function statusKind(statusType = {}) {
  if (statusType.completed || statusType.state === "post") return "final";
  if (statusType.state === "in") return "live";
  return "upcoming";
}

function statusLabel(kind, statusType = {}) {
  if (kind === "final") return "完赛";
  if (kind === "live") {
    if (statusType.shortDetail === "HT") return "中场";
    return statusType.shortDetail && statusType.shortDetail !== "Scheduled" ? statusType.shortDetail : "进行中";
  }
  return "待开赛";
}

export function normalizeEspnEvent(event) {
  const home = getCompetitor(event, "home");
  const away = getCompetitor(event, "away");
  const homeCode = home?.team?.abbreviation || "";
  const awayCode = away?.team?.abbreviation || "";
  const homeName = teamName(homeCode, home?.team?.displayName);
  const awayName = teamName(awayCode, away?.team?.displayName);
  const kind = statusKind(event.status?.type);
  const scoreline = kind === "upcoming" ? "VS" : `${home?.score ?? 0}-${away?.score ?? 0}`;
  const group = GROUP_BY_TEAM[homeCode] && GROUP_BY_TEAM[homeCode] === GROUP_BY_TEAM[awayCode]
    ? `${GROUP_BY_TEAM[homeCode]} 组`
    : "小组赛";
  const kickoff = new Date(event.date);
  const href = event.links?.find((link) => link.href)?.href || "https://www.espn.com/soccer/scoreboard/_/league/fifa.world";

  return {
    id: String(event.id),
    date: event.date,
    kickoffBeijing: `${formatBeijing(kickoff)} 北京`,
    group,
    venue: cityName(event.competitions?.[0]?.venue),
    statusKind: kind,
    statusLabel: statusLabel(kind, event.status?.type),
    scoreline,
    title: kind === "upcoming" ? `${homeName} vs ${awayName}` : `${homeName} ${scoreline} ${awayName}`,
    href,
    home: {
      code: homeCode,
      name: homeName,
      score: home?.score ?? "0",
      flag: `assets/flags/${homeCode}.png`
    },
    away: {
      code: awayCode,
      name: awayName,
      score: away?.score ?? "0",
      flag: `assets/flags/${awayCode}.png`
    }
  };
}

function sortByDate(matches) {
  return [...matches].sort((left, right) => new Date(left.date) - new Date(right.date));
}

export function mergeHistoricalMatches(previousMatches = [], currentMatches = []) {
  const finalsById = new Map();
  for (const match of previousMatches) {
    if (match?.id && match.statusKind === "final") finalsById.set(String(match.id), match);
  }
  for (const match of currentMatches) {
    if (match?.id && match.statusKind === "final") finalsById.set(String(match.id), match);
  }
  return [...finalsById.values()].sort((left, right) => new Date(right.date) - new Date(left.date));
}

export function buildSnapshot({ now = new Date(), sourceUrl, events, previousMatches = [] }) {
  const matches = sortByDate(events.map(normalizeEspnEvent));
  const live = matches.filter((match) => match.statusKind === "live");
  const recentCompleted = mergeHistoricalMatches(
    [...BASELINE_FINALS, ...previousMatches],
    matches.filter((match) => new Date(match.date) <= now)
  );
  const upcoming = matches
    .filter((match) => match.statusKind === "upcoming" && new Date(match.date) >= now)
    .slice(0, 8);
  const scoreboard = [
    ...live,
    ...recentCompleted,
    ...upcoming
  ].slice(0, 4);

  return {
    schemaVersion: 1,
    source: "ESPN FIFA World Cup scoreboard",
    sourceUrl,
    generatedAt: now.toISOString(),
    generatedAtBeijing: `北京时间 ${formatBeijing(now)}`,
    matches,
    live,
    recentCompleted,
    upcoming,
    scoreboard
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "user-agent": "ai-cup-26 snapshot updater"
    }
  });
  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function readPreviousSnapshot(outputPath) {
  try {
    const raw = await fs.readFile(outputPath, "utf8");
    const snapshot = JSON.parse(raw);
    return Array.isArray(snapshot.matches) ? snapshot.matches : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function updateMatches({ now = new Date(), outputPath = OUTPUT_PATH } = {}) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const absoluteOutputPath = path.resolve(repoRoot, outputPath);
  const previousMatches = await readPreviousSnapshot(absoluteOutputPath);
  const dates = dateRangeFor(now);
  const sourceUrl = `${ESPN_SCOREBOARD_URL}?dates=${dates}`;
  const payload = await fetchJson(sourceUrl);
  const events = Array.isArray(payload.events) ? payload.events : [];
  if (events.length === 0) {
    throw new Error(`ESPN returned no events for ${dates}`);
  }

  const snapshot = buildSnapshot({ now, sourceUrl, events, previousMatches });
  await fs.mkdir(path.dirname(absoluteOutputPath), { recursive: true });
  await fs.writeFile(absoluteOutputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const now = process.env.MATCH_SNAPSHOT_NOW ? new Date(process.env.MATCH_SNAPSHOT_NOW) : new Date();
  updateMatches({ now })
    .then((snapshot) => {
      console.log(`Updated ${OUTPUT_PATH}: ${snapshot.generatedAtBeijing}, ${snapshot.matches.length} matches`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
