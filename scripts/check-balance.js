// Verifica sintassi del JS inline nel file HTML del progetto (single-file).
// Estrae il contenuto dello <script type="module"> ed esegue:
//   1) node --check --input-type=module (copre syntax errors + paren/brace mismatch)
//   2) conteggio diagnostico di braces {} (non esegue check, solo report)
// Il check autorevole è (1): se passa, il JS è sintatticamente valido.

const fs = require('fs');
const { execFileSync } = require('child_process');

const htmlFile = process.argv[2];
if (!htmlFile) {
  console.error('Uso: node check-balance.js <file.html>');
  process.exit(2);
}

const html = fs.readFileSync(htmlFile, 'utf8');
const re = /<script\s+type=["']module["']\s*>([\s\S]*?)<\/script>/;
const m = html.match(re);
if (!m) {
  console.error('Nessuno <script type="module"> trovato in', htmlFile);
  process.exit(1);
}
const js = m[1];

// (1) node --check autorevolativo: copre syntax + paren/brace balance
try {
  execFileSync('node', ['--check', '--input-type=module', '-'], {
    input: js,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log('node --check --input-type=module: OK');
} catch (e) {
  console.error('node --check: FAILED');
  process.exit(1);
}

// (2) conteggio diagnostico braces (approssimativo, solo per report)
// Rimuove stringhe con sostituzione naive (escape \\\\ poi stringhe single/double/backtick)
// Poi conta { e } sui restanti bytes.
const stripped = js
  .replace(/`(?:\\.|[^`\\])*`/g, '``')                       // template literal ``
  .replace(/'(?:\\.|[^'\\])*'/g, "''")                       // single quote string
  + '"'                                                       // dummy per evitare warning
  ;
// ricostruisci su stringa pulita (sopra è solo diagnostico, non blocca)
const code2 = stripped
  .replace(/"(?:\\.|[^"\\])*"/g, '""');                       // double quote string
let openB = 0, closeB = 0;
for (const c of code2) {
  if (c === '{') openB++;
  else if (c === '}') closeB++;
}
console.log(`braces diagnostico: open=${openB} close=${closeB} (puo' divergere di +-N se ci sono template literal con ${'{...}'} interpolations, e' solo indicativo)`);

console.log('Tutti i check autorevolativi passati.');