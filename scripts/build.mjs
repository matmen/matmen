// Builds assets/banner.png and assets/projects.png, rendered with ImageScript itself
import { Image } from 'imagescript';
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const fontDir = process.env.FONT_DIR ?? '/usr/share/fonts/truetype/dejavu/';
const fonts = ['DejaVuSansMono.ttf', 'DejaVuSansMono-Bold.ttf', 'DejaVuSans.ttf', 'DejaVuSans-Bold.ttf'].map((f) => readFileSync(fontDir + f));
const version = JSON.parse(readFileSync(root + 'node_modules/imagescript/package.json', 'utf8')).version;
const MONO = 'font-family="DejaVu Sans Mono, monospace"', SANS = 'font-family="DejaVu Sans, sans-serif"';
const FG = '#F2F4F8', DIM = '#9aa3b5';
const render = async (name, svg) => writeFileSync(root + 'assets/' + name, await (await Image.renderSVG(svg, { fonts, size: 2 })).encodePNG());

// ---- banner: live numbers, new pixel pattern every day ----
{
  const BG = '#141821', BRAND = ['#FFC857', '#FF8C61', '#E85D8C', '#8E6CEF', '#4C7DF0'];
  let stars = 0, npm = 0, cdn = 0, jsr = 0;
  const j = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); };
  stars = (await j('https://api.github.com/repos/matmen/ImageScript')).stargazers_count;
  npm = (await j('https://api.npmjs.org/downloads/point/last-month/imagescript')).downloads; // last 30 days
  cdn = (await j('https://data.jsdelivr.com/v1/stats/packages/npm/imagescript?period=month')).hits.total; // last 30 days
  const rows = (await j('https://api.jsr.io/scopes/matmen/packages/imagescript/downloads')).total;
  const cut = Math.max(...rows.map((r) => Date.parse(r.timeBucket))) - 30 * 864e5;
  jsr = rows.filter((r) => r.kind === 'npm_tarball' && Date.parse(r.timeBucket) > cut).reduce((n, r) => n + r.count, 0); // jsr_meta is metadata, not downloads
  const total = npm + cdn + jsr;
  const k = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1000) + 'k');
  console.log('downloads 30d:', npm, cdn, jsr, '=', total);

  let seed = (Math.floor(Date.now() / 864e5) * 2654435761) >>> 0;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const wordmark = 'data:image/svg+xml;base64,' + readFileSync(root + 'assets/wordmark.svg').toString('base64');
  const W = 900, H = 280;
  let b = `<rect width="${W}" height="${H}" rx="14" fill="${BG}"/>`;
  for (let x = 30; x < 45; x++) for (let y = 0; y < 14; y++) {
    const fall = Math.min(1, (x - 29) / 13);
    if (rnd() < fall * 0.92) {
      const t = Math.min(4, Math.floor(((x - 30) / 15 * 0.6 + y / 14 * 0.4) * 5));
      b += `<rect x="${x * 20 + 2}" y="${y * 20 + 2}" width="16" height="16" rx="4" fill="${BRAND[t]}" opacity="${(0.12 + rnd() * 0.7).toFixed(2)}"/>`;
    }
  }
  b += `<image href="${wordmark}" x="40" y="34" width="405" height="70"/>`;
  b += `<text x="46" y="140" ${SANS} font-size="18" fill="${FG}">Pure TypeScript image processing that runs everywhere.</text>`;
  [[`${stars} ★`, 'on GitHub', 0], [k(total), 'downloads, last 30 days', 170], ['2020', 'since', 400]].forEach(([v, l, dx]) => {
    b += `<text x="${46 + dx}" y="196" ${MONO} font-size="30" font-weight="bold" fill="${FG}">${v}</text><text x="${46 + dx}" y="218" ${MONO} font-size="12" fill="${DIM}">${l}</text>`;
  });
  b += `<rect x="46" y="236" width="40" height="3" rx="1.5" fill="${BRAND[0]}"/><rect x="90" y="236" width="40" height="3" rx="1.5" fill="${BRAND[2]}"/><rect x="134" y="236" width="40" height="3" rx="1.5" fill="${BRAND[4]}"/>`;
  b += `<text x="46" y="262" ${MONO} font-size="12" fill="${DIM}">rendered with ImageScript v${version}</text>`;
  await render('banner.png', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${b}</svg>`);
}

// ---- projects card: GNOME Console look ----
{
  const rows = [
    ['ImageScript', 'zero-dependency image manipulation in pure typescript'],
    ['coinop', 'arcade cabinet running on a raspberry pi'],
    ['bichael', 'geofenced motorcycle auto-unlocking & trip reporting'],
    ['bonbot', 'discord messages to receipt printer'],
    ['powerd', 'wakes & sleeps proxmox hosts, VMs and LXCs'],
    ['fluidd', 'web interface for klipper 3D printers'],
    ['homelab', '5-node proxmox HA cluster'],
  ];
  const HB = '#2b2b2e', TB = '#1d1d20', W = 900, H = 434, GR = '#26a269', BL = '#2a7bde', PU = '#a347ba', ORANGE = '#f0883e';
  const esc = (t) => t.replace(/&/g, '&amp;');
  let b = `<defs><clipPath id="win"><rect width="${W}" height="${H}" rx="14"/></clipPath></defs>`;
  b += `<g clip-path="url(#win)"><rect width="${W}" height="${H}" fill="${TB}"/><rect width="${W}" height="56" fill="${HB}"/>`;
  b += `<text x="${W / 2}" y="26" ${SANS} font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">~ - fish</text>`;
  b += `<text x="${W / 2}" y="42" ${SANS} font-size="10" fill="${DIM}" text-anchor="middle">~</text>`;
  b += `<circle cx="29" cy="27" r="5.5" fill="none" stroke="#fff" stroke-width="2"/><path d="M33,31 L38,36" stroke="#fff" stroke-width="2"/>`;
  b += `<rect x="770" y="19" width="16" height="16" rx="3" fill="none" stroke="#fff" stroke-width="2"/><path d="M778,23 V31 M774,27 H782" stroke="#fff" stroke-width="2"/>`;
  b += `<path d="M812,21 H828 M812,27 H828 M812,33 H828" stroke="#fff" stroke-width="2"/>`;
  b += `<circle cx="866" cy="27" r="12" fill="#fff" opacity="0.1"/><path d="M861,22 L871,32 M871,22 L861,32" stroke="#fff" stroke-width="2"/>`;
  const X = 24, F = 15;
  b += `<text x="${X}" y="96" ${MONO} font-size="12" fill="${BL}">~</text>`;
  b += `<text x="${X}" y="118" ${MONO} font-size="${F}" xml:space="preserve"><tspan fill="${PU}">❯</tspan><tspan fill="${FG}"> ls ~/projects</tspan></text>`;
  b += `<text x="${X}" y="152" ${MONO} font-size="${F}" font-weight="bold" fill="${GR}">mathis<tspan fill="${FG}" font-weight="normal">@</tspan>matmen.dev</text>`;
  b += `<text x="${X}" y="170" ${MONO} font-size="${F}" fill="${FG}">${'-'.repeat(17)}</text>`;
  let y = 198;
  for (const [name, desc] of rows) {
    b += `<text x="${X}" y="${y}" ${MONO} font-size="${F}" font-weight="bold" fill="${ORANGE}">${name}</text><text x="${X + 14 * 9.03}" y="${y}" ${MONO} font-size="${F}" fill="${FG}">${esc(desc)}</text>`;
    y += 24;
  }
  b += `<text x="${X}" y="${y + 18}" ${MONO} font-size="12" fill="${BL}">~</text>`;
  b += `<text x="${X}" y="${y + 40}" ${MONO} font-size="${F}" fill="${PU}">❯</text><rect x="${X + 19}" y="${y + 26}" width="9" height="19" fill="${FG}"/></g>`;
  await render('projects.png', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${b}</svg>`);
}
