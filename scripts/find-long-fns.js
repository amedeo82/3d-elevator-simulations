const fs = require('fs');
const text = fs.readFileSync('elevator.html', 'utf8');
const pattern = /^function (\w+)\(/gm;
const matches = [...text.matchAll(pattern)];
const starts = matches.map(m => ({ name: m[1], index: m.index, line: text.slice(0, m.index).split('\n').length - 1 }));
// Walk each function: track brace depth from its opening '{' until depth returns to 0
const stats = [];
for (let i = 0; i < starts.length; i++) {
  const f = starts[i];
  // Locate the opening brace on the function's "function name(...) {" line
  let bracePos = text.indexOf('{', f.index);
  if (bracePos === -1) continue;
  let depth = 1;
  let pos = bracePos + 1;
  while (pos < text.length && depth > 0) {
    const ch = text[pos];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    pos++;
  }
  const endLine = text.slice(0, pos).split('\n').length - 1;
  stats.push({ name: f.name, lines: endLine - f.line, startLine: f.line + 1, endLine: endLine + 1 });
}
stats.sort((a, b) => b.lines - a.lines);
console.log('Top 30 longest functions (proper brace count):');
stats.slice(0, 30).forEach(s => console.log('  ' + String(s.lines).padStart(4) + ' lines  L' + s.startLine + '-L' + s.endLine + '  ' + s.name));
console.log('\nFunctions >= 80 lines:');
stats.filter(s => s.lines >= 80).forEach(s => console.log('  ' + String(s.lines).padStart(4) + '  L' + s.startLine + '  ' + s.name));
console.log('\nFunctions >= 150 lines:');
stats.filter(s => s.lines >= 150).forEach(s => console.log('  ' + String(s.lines).padStart(4) + '  L' + s.startLine + '  ' + s.name));
