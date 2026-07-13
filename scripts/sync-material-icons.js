#!/usr/bin/env node

/**
 * Escanea src/ buscando los iconos de Material Symbols que realmente se usan
 * y compara/actualiza la lista `icon_names` del <link> de Google Fonts en index.html.
 *
 * Uso:
 *   node scripts/sync-material-icons.js          -> actualiza index.html si hay diferencias
 *   node scripts/sync-material-icons.js --check  -> solo reporta, no escribe (exit 1 si faltan iconos)
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const INDEX_HTML = path.join(SRC_DIR, 'index.html');

// Iconos usados de forma dinámica que no se pueden detectar por análisis
// estático (valores por defecto de señales, argumentos a servicios, etc).
const EXTRA_ICONS = ['info', 'error', 'warning', 'check_circle'];

function walk(dir, exts, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, exts, files);
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

const icons = new Set(EXTRA_ICONS);

// 1. Uso estático: <i class="material-symbols-rounded ...">icon_name</i>
const tagRegex = /<i\b[^>]*\b\[?class\]?="[^"]*\bmaterial-symbols-rounded\b[^"]*"[^>]*>\s*([a-zA-Z0-9_]+)\s*<\/i>/g;
// 2. Ternarios: {{ condicion ? 'icono_a' : 'icono_b' }}
const ternaryRegex = /material-symbols-rounded\b[^>]*>\s*\{\{[^}]*?'([a-zA-Z0-9_]+)'[^}]*?'([a-zA-Z0-9_]+)'[^}]*\}\}/g;

for (const file of walk(SRC_DIR, ['.html'])) {
  const content = fs.readFileSync(file, 'utf8');
  for (const m of content.matchAll(tagRegex)) icons.add(m[1]);
  for (const m of content.matchAll(ternaryRegex)) {
    icons.add(m[1]);
    icons.add(m[2]);
  }
}

// 3. Iconos definidos en TS para menús/listas dinámicas: icon: 'icon_name'
const tsIconRegex = /\bicon\s*:\s*['"]([a-zA-Z0-9_]+)['"]/g;
for (const file of walk(SRC_DIR, ['.ts'])) {
  const content = fs.readFileSync(file, 'utf8');
  for (const m of content.matchAll(tsIconRegex)) icons.add(m[1]);
}

const found = [...icons].sort();

// Leer lista actual del <link> en index.html
const html = fs.readFileSync(INDEX_HTML, 'utf8');
const linkRegex = /(https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Rounded[^"]*?icon_names=)([^&"]*)(.*?&display=swap)/;
const match = html.match(linkRegex);
if (!match) {
  console.error('No se encontró el <link> de Material Symbols en index.html');
  process.exit(1);
}
const current = match[2].split(',').filter(Boolean).sort();

const missing = found.filter((i) => !current.includes(i));
const unused = current.filter((i) => !found.includes(i));

console.log(`Iconos detectados en el código: ${found.length}`);
console.log(`Iconos en index.html actual:    ${current.length}`);

if (missing.length) {
  console.log(`\n⚠ Faltan en index.html (${missing.length}):\n  ${missing.join(', ')}`);
}
if (unused.length) {
  console.log(`\nℹ En index.html pero no detectados en el código (${unused.length}):\n  ${unused.join(', ')}`);
}
if (!missing.length && !unused.length) {
  console.log('\n✓ La lista está sincronizada.');
}

const checkMode = process.argv.includes('--check');

if (checkMode) {
  process.exit(missing.length ? 1 : 0);
}

if (missing.length || unused.length) {
  const newList = found.join(',');
  const newHtml = html.replace(linkRegex, `$1${newList}$3`);
  fs.writeFileSync(INDEX_HTML, newHtml);
  console.log('\nindex.html actualizado.');
}
