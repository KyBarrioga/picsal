import type { NextApiRequest, NextApiResponse } from "next";

const paletteMap = {
  ember: {
    bg1: "#241307",
    bg2: "#070707",
    glow1: "#f59e0b",
    glow2: "#fb923c",
    line: "#fde68a",
    block: "#7c2d12",
  },
  gold: {
    bg1: "#201308",
    bg2: "#050505",
    glow1: "#fbbf24",
    glow2: "#f59e0b",
    line: "#fff7ed",
    block: "#92400e",
  },
  velvet: {
    bg1: "#170d09",
    bg2: "#040404",
    glow1: "#fb923c",
    glow2: "#fdba74",
    line: "#ffedd5",
    block: "#9a3412",
  },
  market: {
    bg1: "#22140a",
    bg2: "#080808",
    glow1: "#f59e0b",
    glow2: "#fcd34d",
    line: "#fef3c7",
    block: "#78350f",
  },
  signal: {
    bg1: "#1f1208",
    bg2: "#060606",
    glow1: "#fb923c",
    glow2: "#facc15",
    line: "#fed7aa",
    block: "#7c2d12",
  },
  static: {
    bg1: "#170f0a",
    bg2: "#050505",
    glow1: "#fbbf24",
    glow2: "#fdba74",
    line: "#fffbeb",
    block: "#a16207",
  },
  cathedral: {
    bg1: "#1e1108",
    bg2: "#060606",
    glow1: "#f59e0b",
    glow2: "#fcd34d",
    line: "#fef3c7",
    block: "#9a3412",
  },
  archive: {
    bg1: "#221309",
    bg2: "#080808",
    glow1: "#fb923c",
    glow2: "#fbbf24",
    line: "#fff7ed",
    block: "#78350f",
  },
  foxfire: {
    bg1: "#1d1209",
    bg2: "#050505",
    glow1: "#f97316",
    glow2: "#fcd34d",
    line: "#ffedd5",
    block: "#7c2d12",
  },
  cinder: {
    bg1: "#24160a",
    bg2: "#070707",
    glow1: "#fb923c",
    glow2: "#fbbf24",
    line: "#fef3c7",
    block: "#92400e",
  },
  lantern: {
    bg1: "#201107",
    bg2: "#040404",
    glow1: "#f59e0b",
    glow2: "#fdba74",
    line: "#fff7ed",
    block: "#9a3412",
  },
  brass: {
    bg1: "#25170b",
    bg2: "#070707",
    glow1: "#fbbf24",
    glow2: "#fb923c",
    line: "#fef3c7",
    block: "#78350f",
  },
} as const;

function numericSeed(value: string) {
  return String(value).split("").reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0);
}

type SvgOptions = {
  slug: string;
  widthUnits: number;
  heightUnits: number;
  palette: keyof typeof paletteMap | string;
  seed: string;
};

function buildSvg({ slug, widthUnits, heightUnits, palette, seed }: SvgOptions) {
  const colors = paletteMap[palette as keyof typeof paletteMap] ?? paletteMap.ember;
  const base = numericSeed(`${slug}-${seed}-${widthUnits}-${heightUnits}`);
  const width = widthUnits * 384;
  const height = heightUnits * 273;
  const circleA = 110 + (base % 160);
  const circleB = 160 + (base % 190);
  const leftX = 100 + (base % 220);
  const rightX = width - 180 - (base % 240);
  const topY = 110 + ((base * 3) % Math.max(200, Math.floor(height * 0.22)));
  const midY = Math.floor(height * 0.48) + ((base * 5) % Math.max(180, Math.floor(height * 0.14)));
  const blockWidth = 150 + (base % 140);
  const blockHeight = 220 + (base % 320);
  const blockX = 90 + ((base * 7) % Math.max(220, width - blockWidth - 180));
  const blockY = Math.floor(height * 0.28) + ((base * 11) % Math.max(180, Math.floor(height * 0.28)));
  const lineY = height - (120 + (base % 110));
  const lineY2 = lineY - (44 + (base % 40));
  const waveTop = Math.floor(height * 0.7);
  const waveHeight = 120 + (base % 120);
  const label = slug.replace(/-/g, " ").toUpperCase();

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${colors.bg2}"/>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <circle cx="${leftX}" cy="${topY}" r="${circleA}" fill="${colors.glow2}" fill-opacity="0.16"/>
      <circle cx="${rightX}" cy="${midY}" r="${circleB}" fill="${colors.glow1}" fill-opacity="0.17"/>
      <path d="M0 ${waveTop}C${Math.floor(width * 0.22)} ${waveTop - waveHeight} ${Math.floor(width * 0.38)} ${waveTop + 40} ${Math.floor(width * 0.58)} ${waveTop - 12}C${Math.floor(width * 0.74)} ${waveTop - 56} ${Math.floor(width * 0.88)} ${waveTop + 48} ${width} ${waveTop - 18}V${height}H0V${waveTop}Z" fill="${colors.block}" fill-opacity="0.74"/>
      <rect x="${blockX}" y="${blockY}" width="${blockWidth}" height="${blockHeight}" fill="${colors.block}" fill-opacity="0.88"/>
      <rect x="${blockX + 44}" y="${Math.max(80, blockY - 150)}" width="${Math.max(12, blockWidth - 88)}" height="${Math.max(60, Math.floor(blockHeight * 0.42))}" fill="${colors.glow1}" fill-opacity="0.56"/>
      <path d="M96 ${lineY2}H${width - 96}" stroke="${colors.line}" stroke-opacity="0.76" stroke-width="10" stroke-linecap="square"/>
      <path d="M96 ${lineY}H${width - 96}" stroke="${colors.glow2}" stroke-opacity="0.65" stroke-width="20" stroke-linecap="square"/>
      <rect x="78" y="72" width="${Math.min(340, Math.floor(width * 0.23))}" height="26" fill="${colors.line}" fill-opacity="0.34"/>
      <rect x="78" y="108" width="${Math.min(240, Math.floor(width * 0.16))}" height="16" fill="${colors.line}" fill-opacity="0.22"/>
      <text x="${width - 86}" y="${height - 38}" fill="${colors.line}" fill-opacity="0.46" font-family="Arial, sans-serif" font-size="18" text-anchor="end">${label}</text>
      <defs>
        <linearGradient id="bg" x1="${width}" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
          <stop stop-color="${colors.bg1}"/>
          <stop offset="1" stop-color="${colors.bg2}"/>
        </linearGradient>
      </defs>
    </svg>
  `.trim();
}

export default function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  const slug = String(req.query.slug ?? "artovae");
  const palette = String(req.query.palette ?? "ember");
  const seed = String(req.query.seed ?? "1");
  const widthUnits = Math.max(1, Number(req.query.widthUnits ?? "1"));
  const heightUnits = Math.max(1, Number(req.query.heightUnits ?? "1"));
  const svg = buildSvg({
    slug,
    widthUnits,
    heightUnits,
    palette,
    seed,
  });

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.status(200).send(svg);
}
