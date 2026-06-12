const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const flagsDir = path.join(root, "assets", "flags");

const teams = [
  ["墨西哥", "MEX"],
  ["南非", "RSA"],
  ["韩国", "KOR"],
  ["捷克", "CZE"],
  ["加拿大", "CAN"],
  ["波黑", "BIH"],
  ["卡塔尔", "QAT"],
  ["瑞士", "SUI"],
  ["巴西", "BRA"],
  ["摩洛哥", "MAR"],
  ["海地", "HAI"],
  ["苏格兰", "SCO"],
  ["美国", "USA"],
  ["巴拉圭", "PAR"],
  ["澳大利亚", "AUS"],
  ["土耳其", "TUR"],
  ["德国", "GER"],
  ["库拉索", "CUW"],
  ["科特迪瓦", "CIV"],
  ["厄瓜多尔", "ECU"],
  ["荷兰", "NED"],
  ["日本", "JPN"],
  ["瑞典", "SWE"],
  ["突尼斯", "TUN"],
  ["比利时", "BEL"],
  ["埃及", "EGY"],
  ["伊朗", "IRN"],
  ["新西兰", "NZL"],
  ["西班牙", "ESP"],
  ["佛得角", "CPV"],
  ["沙特阿拉伯", "KSA"],
  ["乌拉圭", "URU"],
  ["法国", "FRA"],
  ["塞内加尔", "SEN"],
  ["伊拉克", "IRQ"],
  ["挪威", "NOR"],
  ["阿根廷", "ARG"],
  ["阿尔及利亚", "ALG"],
  ["奥地利", "AUT"],
  ["约旦", "JOR"],
  ["葡萄牙", "POR"],
  ["刚果民主共和国", "COD"],
  ["乌兹别克斯坦", "UZB"],
  ["哥伦比亚", "COL"],
  ["英格兰", "ENG"],
  ["克罗地亚", "CRO"],
  ["加纳", "GHA"],
  ["巴拿马", "PAN"]
];

const html = fs.readFileSync(indexPath, "utf8");
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const failures = [];

for (const [name, code] of teams) {
  const src = `assets/flags/${code}.png`;
  const filePath = path.join(flagsDir, `${code}.png`);

  if (!html.includes(`src="${src}"`)) {
    failures.push(`${name} (${code}) is not rendered from ${src}`);
  }

  if (!fs.existsSync(filePath)) {
    failures.push(`${src} is missing`);
    continue;
  }

  const contents = fs.readFileSync(filePath);
  if (contents.length <= pngSignature.length || !contents.subarray(0, 8).equals(pngSignature)) {
    failures.push(`${src} is not a valid PNG`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
