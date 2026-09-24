var fs=require('fs');
var s=fs.readFileSync('elevator.html','utf8');

// Find the two STRINGS objects: STRINGS = { it: {...}, en: {...} }
// Extract just the it and en inner objects.
function extractLangBlock(lang) {
  var idx = s.indexOf(lang + ': {');
  if (idx < 0) return null;
  var start = s.indexOf('{', idx);
  // match braces respecting single-quote strings with escaped quotes
  var depth = 0;
  var end = start;
  var inStr = false;
  for (var i = start; i < s.length; i++) {
    var c = s[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === "'") inStr = false;
    } else {
      if (c === "'") inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
  }
  return s.slice(start, end + 1);
}

function parseKeys(block) {
  // Match: key: 'value with \\\' escapes' OR key: 'value'
  // Skip template literals and functions.
  var out = {};
  var re = /(\w+):\s*'((?:\\'|[^'])*)'/g;
  var m;
  while ((m = re.exec(block)) !== null) {
    out[m[1]] = m[2].replace(/\\'/g, "'").replace(/\\n/g, '\n');
  }
  return out;
}

var itBlock = extractLangBlock('it');
var enBlock = extractLangBlock('en');
var itKeys = parseKeys(itBlock || '');
var enKeys = parseKeys(enBlock || '');

var allKeys = new Set([...Object.keys(itKeys), ...Object.keys(enKeys)]);
console.log('Total unique keys:', allKeys.size);
console.log('IT only:', Object.keys(itKeys).filter(k => !enKeys[k]).length);
console.log('EN only:', Object.keys(enKeys).filter(k => !itKeys[k]).length);

// Output markdown table
var sortedKeys = Array.from(allKeys).sort();
var out = ['| Key | IT | EN |', '|---|---|---|'];
for (var k of sortedKeys) {
  var it = itKeys[k] || '—';
  var en = enKeys[k] || '—';
  it = String(it).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  en = String(en).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  out.push('| `' + k + '` | ' + it + ' | ' + en + ' |');
}
fs.writeFileSync('STRINGS_TABLE.md', out.join('\n') + '\n');
console.log('Wrote STRINGS_TABLE.md with', sortedKeys.length, 'rows');
