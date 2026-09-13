// Estrae il contenuto dello <script type="module"> dal file HTML e lo scrive su stdout.
// Usato dalla CI per eseguire `node --check` sul JS senza parserizzare HTML.
// Exit code 0 se trovato, 1 se assente.

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('Uso: node extract-js.js <file.html>');
  process.exit(2);
}

const html = fs.readFileSync(path.resolve(file), 'utf8');

// cattura lo script di tipo module (esclude importmap che è JSON)
const re = /<script\s+type=["']module["']\s*>([\s\S]*?)<\/script>/;
const m = html.match(re);
if (!m) {
  console.error('Nessuno <script type="module"> trovato in', file);
  process.exit(1);
}

process.stdout.write(m[1]);