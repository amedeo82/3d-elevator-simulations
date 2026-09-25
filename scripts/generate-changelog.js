// Polish Pack V4 Step 6 (D26): genera CHANGELOG.md dalla history git.
// Raggruppa per Polish Pack version (V1, V2, V3, V4) basandosi sul pattern
// dei commit subject. Convention: subject che inizia con "feat|fix|docs|..." +
// contiene "Polish Pack VN" o "Fase NN" viene associato alla versione N.
//
// Uso:  node scripts/generate-changelog.js
// Output: CHANGELOG.md (overwrite). Non committa automaticamente.
//
// Strategia: enumera i commit, assegna a un bucket V1..V4 (o "Altro" se
// non match), ordina per data, formatta come Markdown con sezioni per
// versione + bullets per commit (subject + body prima riga se presente).

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Separatore unlikely: ASCII Unit Separator (0x1F)
const SEP = '\u001F';

function getCommits() {
  // git non supporta %x00 come separatore; usiamo --pretty=format
  // con un placeholder testuale (XXHASHXX) che sostituiamo post-processing.
  const placeholder = 'XXHASHXX';
  const fmt = `%H${placeholder}%ai${placeholder}%s${placeholder}%b`;
  const raw = execSync(`git log --pretty=format:"${fmt}"`, { encoding: 'utf8' });
  // git separa i commit con newline; il body puo' contenere newline,
  // quindi parsiamo riga per riga e accumuliamo il body fino al prossimo hash.
  const lines = raw.split('\n');
  const commits = [];
  let current = null;
  // Date "2026-09-25 16:52:43 +0200" contiene spazi, quindi .+? non-greedy.
  const hashRe = /^([0-9a-f]{40})XXHASHXX(.+?)XXHASHXX(.*?)XXHASHXX(.*)$/;
  for (const line of lines) {
    if (!line.trim()) continue;
    const m = line.match(hashRe);
    if (m) {
      if (current) commits.push(current);
      current = {
        hash: m[1],
        date: m[2].trim(),
        subject: m[3].trim(),
        body: m[4].trim()
      };
    } else if (current) {
      // body continuazione (raro con --pretty=format ma succede)
      current.body += '\n' + line.trim();
    }
  }
  if (current) commits.push(current);
  return commits;
}

function bucketize(commit) {
  // Pattern: "Polish Pack V2 Step N", "Fase 5", "feat: ... (V4 Step 2 D22)"
  const subj = commit.subject;
  const all = subj + ' ' + commit.body;
  if (/Polish Pack V4|V4 Step \d|D2[2-6]/.test(all)) return 'V4';
  if (/Polish Pack V3|V3 Step \d|D1[2-9]|D2[01]/.test(all)) return 'V3';
  if (/Polish Pack V2|V2 Step \d|D[7-9]|D10|D11/.test(all)) return 'V2';
  if (/Polish Pack V?1|D[1-6]\b|Phase \d+|Fase \d+/.test(all)) return 'V1';
  return 'altro';
}

function formatVersion(name, commits) {
  if (commits.length === 0) return '';
  const out = [`## ${name}`, ''];
  for (const c of commits) {
    // Skip pure merge commits (no substantive content)
    if (/^Merge /.test(c.subject)) continue;
    const shortHash = c.hash.slice(0, 7);
    out.push(`- ${c.subject} (\`${shortHash}\`)`);
  }
  out.push('');
  return out.join('\n');
}

function main() {
  const commits = getCommits();
  if (commits.length === 0) {
    console.error('Nessun commit trovato. Esegui dentro un repo git.');
    process.exit(1);
  }
  const buckets = { V1: [], V2: [], V3: [], V4: [], altro: [] };
  for (const c of commits) buckets[bucketize(c)].push(c);
  const header = `# Changelog\n\nGenerato automaticamente da \`scripts/generate-changelog.js\`.\nI bucket sono assegnati euristicamente dal subject/body del commit (pattern\n"Polish Pack VN Step M" o "Fase NN"). Per dettagli completi: \`git log\`.\n`;
  const sections = [
    header,
    '\n---\n',
    formatVersion('Polish Pack V4 (2026-09)', buckets.V4),
    formatVersion('Polish Pack V3 (2026-08/09)', buckets.V3),
    formatVersion('Polish Pack V2 (2026-08/09)', buckets.V2),
    formatVersion('Polish Pack V1 + fase iniziale (2026-08 e precedenti)', buckets.V1),
    formatVersion('Altro (infrastruttura, doc, fix)', buckets.altro),
  ].filter(Boolean).join('\n');
  const outPath = path.join(__dirname, '..', 'CHANGELOG.md');
  fs.writeFileSync(outPath, sections);
  const stats = Object.entries(buckets).map(([k, v]) => `${k}: ${v.length}`).join(', ');
  console.log(`CHANGELOG.md generato (${commits.length} commit: ${stats})`);
}

main();
