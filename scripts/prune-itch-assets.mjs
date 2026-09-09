// Prune build-only asset bloat before packaging for itch.io, which caps
// HTML5 projects at 1000 files. Operates on dist/ ONLY (never public/), so the
// source asset library stays intact. Deletes oggs from a whitelist of
// LIBRARY-ONLY sound packs that the game never reaches via a "Pack/file" path
// reference (SOUND_MAP value, music/ambience path, or direct play). Missing
// sounds degrade gracefully (silence, no crash). Re-run after every build.
//
// Usage: node scripts/prune-itch-assets.mjs
import { readFileSync, readdirSync, statSync, rmSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const SOUNDS = join(ROOT, 'dist', 'assets', 'Sounds');

// Packs that are pure sound libraries / debug-browser fodder: only a handful
// of entries (if any) are wired into gameplay. We keep whatever IS referenced
// and drop the rest. Add packs here only after confirming they hold no
// dynamically-constructed gameplay sounds.
const LIBRARY_PACKS = new Set(['ImpactAudio', 'CasinoAudio']);

// Collect every "Dir/file" style path literal in src (SOUND_MAP values, music,
// ambience, direct plays). Bare pack-array names (no slash) are excluded on
// purpose — those are the library entries we're pruning.
let src = '';
for (const f of readdirSync(SRC)) if (f.endsWith('.js')) src += '\n' + readFileSync(join(SRC, f), 'utf8');
const refPaths = new Set();
for (const m of src.matchAll(/['"`]([A-Za-z0-9_][A-Za-z0-9_ -]*\/[A-Za-z0-9_./ -]+?)['"`]/g)) {
  refPaths.add(m[1].replace(/\.ogg$/i, '').toLowerCase());
}

let deleted = 0, kept = 0;
for (const pack of LIBRARY_PACKS) {
  const dir = join(SOUNDS, pack);
  let entries;
  try { entries = readdirSync(dir); } catch { continue; }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory() || extname(e).toLowerCase() !== '.ogg') continue;
    const relPath = `${pack}/${basename(e, '.ogg')}`.toLowerCase();
    if (refPaths.has(relPath)) { kept++; continue; }
    rmSync(p);
    deleted++;
  }
}

// Report the resulting total file count so the caller can confirm < 1000.
let total = 0;
(function walk(d) { for (const e of readdirSync(d)) { const p = join(d, e); if (statSync(p).isDirectory()) walk(p); else total++; } })(join(ROOT, 'dist'));
console.log(`Pruned ${deleted} library sounds (kept ${kept} referenced). dist now has ${total} files.`);
