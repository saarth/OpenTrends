const fs = require('fs');
const XLSX = require('./vendor/xlsx.full.min.js');
const TA = require('./analysis.js');
global.window = {};
require('./default_groups.js');
require('./default_brands.js');

const groups = window.DEFAULT_CLASSIFICATION;
const brands = window.DEFAULT_BRANDS;
const types = window.DEFAULT_PRODUCT_TYPES;

const PC = ['candle','candles','wax melt','wax melts','wax warmer','diffuser','air freshener','room spray','room freshener','car freshener','car air freshener','incense','soap','body wash','lotion','body mist','body spray','perfume oil','cologne','detergent','laundry','scented'];
const norm = window.BRAND_NORMALIZE;

const SRC = process.argv[2] || 'Fragrance Trends GKP Data Sep2026.xlsx';
const wb = XLSX.read(fs.readFileSync(SRC), { type: 'buffer', cellDates: true, dense: true });

// Google's sheet name carries an export timestamp, so pick the sheet whose header
// actually looks like a Keyword Planner export instead of hard-coding it.
function readExportSheet(workbook) {
  let fallback = null;
  for (const name of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, raw: true, defval: null });
    const header = rows[0] || [];
    const keywordCol = header.findIndex(h => typeof h === 'string' && /^(keyword|keywords|query|search term)$/i.test(h.trim()));
    const dateCount = header.filter(h => h instanceof Date).length;
    if (keywordCol !== -1 && dateCount) return { rows, header, keywordCol };
    if (!fallback && keywordCol !== -1) fallback = { rows, header, keywordCol };
  }
  return fallback;
}

const sheet = readExportSheet(wb);
if (!sheet) throw new Error('No Keyword Planner style sheet found in ' + SRC);
const rows = sheet.rows;
const header = sheet.header;
const keywordCol = sheet.keywordCol;
const amsCol = header.findIndex(h => typeof h === 'string' && /^(ams|avg\.?\s*monthly searches|average monthly searches|search volume)$/i.test(h.trim()));
const amsIndex = amsCol === -1 ? 2 : amsCol;

// Month cells are local midnight on the 1st; read local parts so the month label
// matches the month Google exported (ISO conversion would shift it a day back).
const dateCols = [];
header.forEach((h, i) => {
  if (!(h instanceof Date) || isNaN(h)) return;
  dateCols.push({ i, iso: h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-01' });
});
dateCols.sort((a, b) => a.iso.localeCompare(b.iso));
let nCols = dateCols.length;
while (nCols > 1) {
  let s = 0;
  for (let r = 1; r < rows.length; r++) { const v = rows[r][dateCols[nCols - 1].i]; if (typeof v === 'number') s += v; }
  if (s !== 0) break;
  nCols--;
}
const dateIsos = dateCols.map(c => c.iso).slice(0, nCols);
const seen = new Set();
const data = [];
for (let r = 1; r < rows.length; r++) {
  const row = rows[r] || [];
  const kw = row[keywordCol];
  if (typeof kw !== 'string' || !kw.trim()) continue;
  const key = kw.trim().toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  data.push({
    keyword: kw.trim(),
    ams: typeof row[amsIndex] === 'number' ? row[amsIndex] : 0,
    monthly: dateCols.slice(0, nCols).map(c => (typeof row[c.i] === 'number' ? row[c.i] : 0))
  });
}
console.log('source', SRC, 'sheet', wb.SheetNames.length, '| rows', data.length, 'months', nCols, '|', dateIsos[0], 'to', dateIsos[nCols - 1]);

const t0 = Date.now();
const result = TA.analyze(data, groups, { dates: dateIsos, shortWindow: 12, longWindow: 48, topLimit: 500, contextWords: PC, bareNotes: true });
const brandResult = TA.analyze(data, brands, { dates: dateIsos, shortWindow: 12, longWindow: 48, topLimit: 200, contextWords: PC, normalize: norm });
const typeResult = TA.analyze(data, types, { dates: dateIsos, shortWindow: 12, longWindow: 48, topLimit: 200, contextWords: PC });
const crossBrands = TA.crossTab(data, groups, brands, { contextWords: PC, bareNotes: true, normalize: norm });
const crossTypes = TA.crossTab(data, groups, types, { contextWords: PC, bareNotes: true });
console.log('analysis ms', Date.now() - t0);

// Family views keep a shorter top list; term drill-down keeps 200 rows with pre-computed growth.
result.groups.forEach(g => {
  if (g.topKeywords && g.topKeywords.length > 200) g.topKeywords = g.topKeywords.slice(0, 200);
  (g.topKeywords || []).forEach(k => { delete k.monthly; });
  (g.terms || []).forEach(t => {
    const list = t.keywordsList || [];
    const dedupe = new Map();
    list.forEach(r => {
      const monthly = r.monthly || [];
      const entry = {
        keyword: r.keyword,
        ams: r.ams,
        latest: Number(monthly[result.totals.endIdx] || 0),
        short: TA.computeGrowth(monthly, result.totals.endIdx, result.totals.shortWindow, result.dates),
        long: TA.computeGrowth(monthly, result.totals.endIdx, result.totals.longWindow, result.dates)
      };
      const prev = dedupe.get(r.keyword);
      if (!prev || r.ams > prev.ams) dedupe.set(r.keyword, entry);
    });
    t.keywordsList = Array.from(dedupe.values()).sort((a, b) => b.ams - a.ams).slice(0, 200);
    // Keep the monthly series so the seasonality tab can focus on a single term.
  });
});

// Brand / product-type groups only need aggregate figures.
brandResult.groups.forEach(g => { delete g.monthly; (g.topKeywords || []).forEach(k => delete k.monthly); (g.terms || []).forEach(t => { delete t.monthly; delete t.keywordsList; }); });
typeResult.groups.forEach(g => { delete g.monthly; (g.topKeywords || []).forEach(k => delete k.monthly); (g.terms || []).forEach(t => { delete t.monthly; delete t.keywordsList; }); });

const payload = {
  generated: new Date().toISOString(),
  dates: result.dates,
  groups: result.groups,
  groupNames: result.groupNames,
  totals: result.totals,
  classification: groups,
  brandResult: brandResult,
  typeResult: typeResult,
  crossBrands: crossBrands,
  crossTypes: crossTypes,
  rowGroups: null,
  brandRowGroups: null,
  typeRowGroups: null
};

const js = 'window.FRAGRANCE_TRENDS_DATA = ' + JSON.stringify(payload) + ';';
fs.writeFileSync('fragrance-trends.js', js);
console.log('size', (js.length / 1024 / 1024).toFixed(2), 'MB');
