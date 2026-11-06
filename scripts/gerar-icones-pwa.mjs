// Gera os ícones estáticos do PWA em public/icons/ a partir de SVG, com o
// mesmo motivo visual de app/apple-icon.tsx (chip quadrado de papel com
// borda coral sobre fundo de tinta, "L" de LotoAnalítica) — identidade
// única para favicon, ícone do iOS e ícone instalado no Android.
//
// O "L" é desenhado com retângulos (não com texto) para não depender das
// fontes instaladas na máquina que roda o script.
//
// Uso: node scripts/gerar-icones-pwa.mjs   (sharp já vem como dependência do Next)
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const INK = "#17171a";
const PAPER = "#f3f1ea";
const PINE = "#c23b22";
const OUT = join(process.cwd(), "public", "icons");
mkdirSync(OUT, { recursive: true });

// Chip + "L" centralizados num quadrado de lado `s`, ocupando `escala` do lado.
function chip(cx, cy, s, escala = 0.6) {
  const lado = s * escala;
  const borda = Math.max(2, s * 0.022);
  const x = cx - lado / 2;
  const y = cy - lado / 2;
  // "L": haste vertical + base, proporções da fonte bold usada no apple-icon.
  const hasteL = lado * 0.13;
  const altL = lado * 0.42;
  const largL = lado * 0.3;
  const lx = cx - largL / 2;
  const ly = cy - altL / 2;
  return `
    <rect x="${x + borda / 2}" y="${y + borda / 2}" width="${lado - borda}" height="${lado - borda}"
          fill="${PAPER}" stroke="${PINE}" stroke-width="${borda}"/>
    <rect x="${lx}" y="${ly}" width="${hasteL}" height="${altL}" fill="${INK}"/>
    <rect x="${lx}" y="${ly + altL - hasteL}" width="${largL}" height="${hasteL}" fill="${INK}"/>`;
}

function svgIcone(s, escala) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <rect width="${s}" height="${s}" fill="${INK}"/>${chip(s / 2, s / 2, s, escala)}</svg>`;
}

// Badge monocromático (Android usa só o canal alfa na barra de status).
function svgBadge(s) {
  const haste = s * 0.16;
  const alt = s * 0.62;
  const larg = s * 0.44;
  const x = (s - larg) / 2;
  const y = (s - alt) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <rect x="${x}" y="${y}" width="${haste}" height="${alt}" fill="#fff"/>
    <rect x="${x}" y="${y + alt - haste}" width="${larg}" height="${haste}" fill="#fff"/></svg>`;
}

// Tela de abertura do iOS (apple-touch-startup-image): papel + chip central.
function svgSplash(w, h) {
  const s = Math.min(w, h);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${PAPER}"/>${chip(w / 2, h / 2, s * 0.5, 0.6)}</svg>`;
}

async function png(svg, arquivo) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(OUT, arquivo));
  console.log("ok", arquivo);
}

await png(svgIcone(192, 0.6), "icon-192.png");
await png(svgIcone(512, 0.6), "icon-512.png");
// Maskable: o chip (60%) já fica dentro da zona segura de 80% exigida pelo
// Android, então o mesmo desenho serve — o fundo de tinta preenche o corte.
await png(svgIcone(512, 0.56), "icon-maskable-512.png");
await png(svgIcone(192, 0.56), "icon-maskable-192.png");
await png(svgBadge(96), "badge-96.png");

// Tamanhos físicos (px) dos iPhones/iPads suportados — retrato.
const SPLASH = [
  [1320, 2868], [1206, 2622], [1290, 2796], [1179, 2556], [1170, 2532],
  [1284, 2778], [1125, 2436], [1242, 2688], [828, 1792], [750, 1334],
  [640, 1136], [1668, 2388], [2048, 2732],
];
for (const [w, h] of SPLASH) await png(svgSplash(w, h), `splash-${w}x${h}.png`);
