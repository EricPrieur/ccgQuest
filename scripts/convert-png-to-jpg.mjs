// Convert every .png under public/assets to .jpg using ffmpeg-static.
// SKIPS public/assets/Icons/** because UI icons (status icons, frames,
// inline pills, etc.) need an alpha channel — JPG would render the
// transparent areas as a solid black box on top of the card art.
// The original .png is removed after a successful conversion.
//
//   node scripts/convert-png-to-jpg.mjs                       # default tree
//   node scripts/convert-png-to-jpg.mjs public/assets/Cards   # subtree
//   node scripts/convert-png-to-jpg.mjs --keep ...            # don't unlink originals
//   node scripts/convert-png-to-jpg.mjs --quality 3 ...       # libjpeg quality 2 (best) - 31 (worst); default 4
//
// Default quality 4 gives a ~6-10x size reduction with visually
// indistinguishable card / background art. Bump lower for keepsakes,
// higher if you want even smaller files at the cost of softness.

import { spawnSync } from 'node:child_process';
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const args = process.argv.slice(2);
const keep = args.includes('--keep');
const qIdx = args.indexOf('--quality');
const quality = qIdx !== -1 ? args[qIdx + 1] : '4';
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--quality');
const root = resolve(positional[0] || 'public/assets');

// Directories whose images must keep their alpha channel — JPG would
// flatten transparency to solid black. Add new entries here.
const SKIP_DIR_SEGMENTS = new Set(['Icons']);

let converted = 0;
let skipped = 0;
let failed = 0;
let bytesIn = 0;
let bytesOut = 0;

function shouldSkip(full) {
  // Match any directory segment in the path against SKIP_DIR_SEGMENTS.
  const parts = full.split(sep);
  return parts.some(p => SKIP_DIR_SEGMENTS.has(p));
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (entry.toLowerCase().endsWith('.png')) {
      if (shouldSkip(full)) { skipped++; continue; }
      convert(full);
    }
  }
}

function convert(png) {
  const jpg = png.replace(/\.png$/i, '.jpg');
  const sizeIn = statSync(png).size;
  const result = spawnSync(
    ffmpeg,
    ['-y', '-loglevel', 'error', '-i', png, '-q:v', quality, jpg],
    { stdio: ['ignore', 'inherit', 'inherit'] }
  );
  if (result.status !== 0) {
    console.error(`FAILED: ${png}`);
    failed++;
    return;
  }
  const sizeOut = statSync(jpg).size;
  bytesIn += sizeIn;
  bytesOut += sizeOut;
  converted++;
  const pct = ((sizeOut / sizeIn) * 100).toFixed(0);
  console.log(`ok  ${jpg}  (${(sizeIn / 1024).toFixed(0)}kB -> ${(sizeOut / 1024).toFixed(0)}kB, ${pct}%)`);
  if (!keep) unlinkSync(png);
}

walk(root);
console.log(`\n${converted} converted, ${skipped} skipped (Icons), ${failed} failed.`);
if (bytesIn > 0) {
  const inMb = (bytesIn / 1024 / 1024).toFixed(2);
  const outMb = (bytesOut / 1024 / 1024).toFixed(2);
  const savedPct = (100 - (bytesOut / bytesIn) * 100).toFixed(0);
  console.log(`${inMb} MB -> ${outMb} MB (${savedPct}% saved).`);
}
